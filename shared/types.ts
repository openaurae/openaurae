import * as z from "zod";

import {
  $Device,
  $DeviceType,
  $NewDevice,
  $NewSensor,
  $Reading,
  $ReadingKey,
  $Readings,
  $Sensor,
  $SensorType,
  $UpdateDevice,
  $UpdateSensor,
  $ZigbeeSensorType,
} from "./schema";

export type Device = z.infer<typeof $Device>;
export type DeviceType = z.infer<typeof $DeviceType>;
export type Sensor = z.infer<typeof $Sensor>;
export type SensorType = z.infer<typeof $SensorType>;
export type ZigbeeSensorType = z.infer<typeof $ZigbeeSensorType>;

export type ReadingKey = z.infer<typeof $ReadingKey>;

type ReadingTypes = {
  [T in SensorType]: z.infer<(typeof $Readings)[T]>;
};

export type Reading = z.infer<typeof $Reading>;

export type SensorReading<T extends SensorType> = ReadingTypes[T];
export type SensorMetrics<T extends SensorType> = Omit<
  SensorReading<T>,
  keyof ReadingKey
>;
export type SensorMetricName<T extends SensorType> = keyof SensorMetrics<T>;

export type SensorMetricMetadata<
  T extends SensorType,
  K extends SensorMetricName<T> = SensorMetricName<T>,
> = {
  name: K;
  type: TypeToString<SensorReading<T>[K]>;
  displayName: string;
  unit?: string;
};

type TypeToString<T> = T extends string
  ? "string"
  : T extends number
    ? "number"
    : T extends boolean
      ? "boolean"
      : "unknown";

export type DailyReadingStatus = {
  daily_reading_count: number;
  last_update: string;
};

export type GetSensorResult = Sensor &
  DailyReadingStatus & {
    latest_reading: Reading | null;
  };

export type GetDeviceResult = Device &
  DailyReadingStatus & {
    sensors: GetSensorResult[];
  };

export type NewDevice = z.infer<typeof $NewDevice>;
export type UpdateDevice = z.infer<typeof $UpdateDevice>;
export type NewSensor = z.infer<typeof $NewSensor>;
export type UpdateSensor = z.infer<typeof $UpdateSensor>;
