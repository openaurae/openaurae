import type { Sensor, SensorMetricName, SensorReading } from "#shared/types";
import { secondsToDate } from "#shared/utils";
import { type NemoMeasureSet, db } from "~/server/database";
import { upsertDevice, upsertSensor } from "~/server/utils";

import { type NemoSession, login } from "./api";
import { type NemoConfig, configs } from "./config";
import { parseLocation } from "./location";
import {
  $NemoVariableName,
  type NemoMeasureVariable,
  NemoMetricNames,
} from "./types";

export type MigrationOptions = {
  maxMeasureSetUpdatesPerDevice?: number;
};

export async function migrateNemoCloud(
  account: keyof NemoConfig,
  options: MigrationOptions = {},
) {
  console.log(`[nemo-cloud] [${configs[account].url}] start migration`);
  const { maxMeasureSetUpdatesPerDevice = 2 } = options;
  const session = await login(configs[account]);
  const devices = await session.devices();

  const tasks = devices.map(async (device) => {
    const context = { account, session, deviceSerial: device.serial };
    await migrateDevice(context);
    await migrateMeasureSets(context, maxMeasureSetUpdatesPerDevice);
  });

  await Promise.all(tasks);
  console.log(`[nemo-cloud] [${configs[account].url}] finish migration`);
}

type DeviceMigrationContext = {
  session: NemoSession;
  deviceSerial: string;
};

export async function migrateDevice(context: DeviceMigrationContext) {
  const { session, deviceSerial } = context;
  const device = await session.device(deviceSerial);
  if (!device) {
    return;
  }

  const room = device.roomBid ? await session.room(device.roomBid) : null;

  await upsertDevice({
    id: device.serial,
    name: device.name || device.serial,
    type: "nemo_cloud",
    latitude: device.latitude,
    longitude: device.longitude,
    is_public: false,
    user_id: null,
    ...parseLocation(room?.name),
  });
}

export async function migrateMeasureSets(
  context: DeviceMigrationContext,
  maxUpdate = 1,
) {
  const { session, deviceSerial } = context;
  const measureSets = await session.deviceMeasureSets(deviceSerial);
  let totalUpdated = 0;

  for (const { bid, valuesNumber, start, end } of measureSets) {
    const updated = await migrateMeasureSet({
      ...context,
      measureSet: {
        bid,
        device_serial: deviceSerial,
        values_number: valuesNumber,
        start: secondsToDate(start),
        end: secondsToDate(end),
      },
    });

    if (updated) {
      totalUpdated++;
    }

    if (totalUpdated >= maxUpdate) {
      return;
    }
  }
}

type MeasureSetMigrationContext = DeviceMigrationContext & {
  measureSet: NemoMeasureSet;
};

export async function migrateMeasureSet(
  context: MeasureSetMigrationContext,
): Promise<boolean> {
  const { deviceSerial, measureSet } = context;
  const record = await db
    .selectFrom("nemo_measure_sets")
    .where("device_serial", "=", deviceSerial)
    .where("bid", "=", measureSet.bid)
    .selectAll()
    .executeTakeFirst();

  if (record && record.values_number === measureSet.values_number) {
    return false;
  }

  const { id: sensorId } = await migrateMeasureSetSensor(context);
  await migrateMeasures({
    ...context,
    sensorId,
  });

  if (!record) {
    await db
      .insertInto("nemo_measure_sets")
      .values(measureSet)
      .executeTakeFirstOrThrow();
  } else {
    await db
      .updateTable("nemo_measure_sets")
      .set(measureSet)
      .where("device_serial", "=", deviceSerial)
      .where("bid", "=", measureSet.bid)
      .executeTakeFirstOrThrow();
  }

  console.log(
    `[nemo-cloud] [measure-set] migrated ${JSON.stringify(measureSet)}`,
  );
  return true;
}

async function migrateMeasureSetSensor({
  session,
  measureSet,
  deviceSerial,
}: MeasureSetMigrationContext): Promise<Sensor> {
  const { serial, refExposition } = await session.measureSetSensor(
    measureSet.bid,
  );
  return await upsertSensor({
    device_id: deviceSerial,
    id: serial,
    name: refExposition ?? serial,
    type: "nemo_cloud",
  });
}

type MeasuresMigrationContext = MeasureSetMigrationContext & {
  sensorId: string;
};

async function migrateMeasures({
  session,
  measureSet,
  deviceSerial,
  sensorId,
}: MeasuresMigrationContext): Promise<void> {
  const measures = await session.measureSetMeasures(measureSet.bid);
  const metricsByTime = new Map<number, Partial<SensorReading<"nemo_cloud">>>();

  for (const { measureBid, variable } of measures) {
    const metricName = parseMetricName(variable);
    if (!metricName) {
      continue;
    }

    const values = await session.measureValues(measureBid);
    for (const { time: seconds, value } of values) {
      const reading = metricsByTime.get(seconds) ?? {};
      reading[metricName] = value;
      metricsByTime.set(seconds, reading);
    }
  }

  for (const [seconds, reading] of metricsByTime.entries()) {
    await db
      .insertInto("readings_nemo_cloud")
      .values({
        ...reading,
        time: secondsToDate(seconds),
        device_id: deviceSerial,
        sensor_id: sensorId,
      })
      .onConflict((oc) =>
        oc.columns(["device_id", "sensor_id", "time"]).doUpdateSet(reading),
      )
      .execute()
      .catch((error) => console.error(error));
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
