import type {
  Device,
  NemoCloudReading,
  NemoMeasureSet,
  Sensor,
} from "~/server/database";
import { db } from "~/server/database";

import { type Session, login } from "./api";
import { type Configs, configs } from "./config";
import { parseLocation } from "./location";
import {
  type MeasureVariable,
  type VariableName,
  VariableNameSchema,
} from "./types";

export type MigrationOptions = {
  maxMeasureSetUpdatesPerDevice?: number;
};

export async function migrateNemoCloud(
  account: keyof Configs,
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
  session: Session;
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
        start: dateFromSecs(start),
        end: dateFromSecs(end),
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
  const metricsByTime = new Map<number, Partial<NemoCloudReading>>();

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
        time: dateFromSecs(seconds),
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

async function upsertDevice(device: Device) {
  await db
    .insertInto("devices")
    .values(device)
    .onConflict((oc) =>
      oc.column("id").doUpdateSet({
        name: device.name,
        latitude: device.latitude,
        longitude: device.longitude,
        room: device.room,
        building: device.building,
      }),
    )
    .executeTakeFirst();
}

async function upsertSensor(sensor: Sensor): Promise<Sensor> {
  return await db
    .insertInto("sensors")
    .values(sensor)
    .onConflict((oc) =>
      oc.columns(["device_id", "id"]).doUpdateSet({
        name: sensor.name,
      }),
    )
    .returningAll()
    .executeTakeFirstOrThrow();
}

function dateFromSecs(seconds: number): Date {
  return new Date(seconds * 1000);
}

type MetricName = keyof Omit<
  NemoCloudReading,
  "device_id" | "sensor_id" | "time"
>;

function parseMetricName(variable: MeasureVariable | null): MetricName | null {
  const { data: variableName, success } = VariableNameSchema.safeParse(
    variable?.name,
  );

  return success ? metricNameMapping[variableName] : null;
}

export const metricNameMapping: Record<VariableName, MetricName> = {
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
};
