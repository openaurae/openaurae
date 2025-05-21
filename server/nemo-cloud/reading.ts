import type {
  ReadingKey,
  SensorMetricName,
  SensorMetrics,
  SensorReading,
} from "#shared/types";
import { secondsToMilliseconds, toDate } from "date-fns";

import type { NemoSession } from "./api";
import {
  $NemoVariableName,
  type NemoMeasure,
  type NemoMeasureValue,
  type NemoMeasureVariable,
  type NemoVariableName,
} from "./types";

const NemoMetricNames: Record<
  NemoVariableName,
  SensorMetricName<"nemo_cloud">
> = {
  Battery: "battery",
  Formaldehyde: "ch2o",
  Temperature: "tmp",
  Humidity: "rh",
  Pressure: "pressure",
  "Carbon dioxide": "co2",
  "Light Volatile Organic Compounds": "lvoc",
  "Particulate matter 1": "pm1",
  "Particulate matter 2.5": "pm2_5",
  "Particulate matter 4": "pm4",
  "Particulate matter 10": "pm10",
} as const;

type Reading = ReadingKey & Partial<SensorMetrics<"nemo_cloud">>;

export class ReadingStore {
  private readonly session: NemoSession;
  private readonly deviceId: string;
  private readonly sensorId: string;
  private readonly metrics: Map<number, Reading>;

  constructor(session: NemoSession, deviceId: string, sensorId: string) {
    this.session = session;
    this.deviceId = deviceId;
    this.sensorId = sensorId;
    this.metrics = new Map();
  }

  allReadings(): SensorReading<"nemo_cloud">[] {
    return Array.from(this.metrics.values());
  }

  async addMeasures(measureSetBid: number) {
    const measures = await this.session.measureSetMeasures(measureSetBid);

    for (const measure of measures) {
      await this.addMeasure(measure);
    }
  }

  private async addMeasure({
    measureBid,
    variable,
  }: NemoMeasure): Promise<void> {
    const metricName = parseMetricName(variable);
    if (!metricName) {
      return;
    }

    const values = await this.session.measureValues(measureBid);

    for (const value of values) {
      this.addMeasureValue(metricName, value);
    }
  }

  private addMeasureValue(
    metricName: SensorMetricName<"nemo_cloud">,
    { time, value }: NemoMeasureValue,
  ): void {
    const metric = this.metrics.get(time) ?? this.newReading(time);
    metric[metricName] = value;
    this.metrics.set(time, metric);
  }

  private newReading(time: number): Reading {
    return {
      device_id: this.deviceId,
      sensor_id: this.sensorId,
      time: toDate(secondsToMilliseconds(time)),
    };
  }
}

function parseMetricName(
  variable: NemoMeasureVariable | null,
): SensorMetricName<"nemo_cloud"> | null {
  const { data: variableName, success } = $NemoVariableName.safeParse(
    variable?.name,
  );

  return success ? NemoMetricNames[variableName] : null;
}
