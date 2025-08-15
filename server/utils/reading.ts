import type { Reading, Sensor, SensorReading, SensorType } from "#shared/types";
import type { Transaction } from "kysely";

import { type Database, db, readingTable } from "../database";

export async function upsertSensorReading<T extends SensorType>(
  sensorType: T,
  reading: SensorReading<T>,
) {
  await db
    .insertInto(readingTable(sensorType))
    .values(reading)
    .onConflict((oc) =>
      oc.columns(["device_id", "sensor_id", "time"]).doUpdateSet(reading),
    )
    .execute();
}

export async function deleteSensorReadings(
  sensor: Sensor,
  tx?: Transaction<Database>,
): Promise<void> {
  const executor = tx ?? db;
  const table = db.dynamic.table(readingTable(sensor.type));

  await executor
    .deleteFrom(table.as("t"))
    .where("t.device_id", "=", sensor.device_id)
    .where("t.sensor_id", "=", sensor.id)
    .execute();
}

export async function insertSensorReading<T extends SensorType>(
  sensorType: T,
  reading: SensorReading<T>,
) {
  await db.insertInto(readingTable(sensorType)).values(reading).execute();
}

export async function getSensorReadings(
  sensor: Sensor,
  start: Date,
  end: Date,
): Promise<Reading[]> {
  const table = db.dynamic.table(readingTable(sensor.type));

  return await db
    .selectFrom(table.as("t"))
    .selectAll()
    .where("t.device_id", "=", sensor.device_id)
    .where("t.sensor_id", "=", sensor.id)
    .where("t.time", ">=", start)
    .where("t.time", "<=", end)
    .orderBy("t.time", "asc")
    .execute();
}

export async function countSensorReadings(
  sensor: Sensor,
  start: Date,
): Promise<number> {
  const table = db.dynamic.table(readingTable(sensor.type));

  const result = await db
    .selectFrom(table.as("t"))
    .select(({ fn }) => [fn.countAll().as("max_time")])
    .where("t.device_id", "=", sensor.device_id)
    .where("t.sensor_id", "=", sensor.id)
    .where("t.time", ">=", start)
    .executeTakeFirst();

  return Number(result?.max_time ?? 0);
}

export async function getSensorLatestReading(
  sensor: Sensor,
): Promise<Reading | null> {
  const table = db.dynamic.table(readingTable(sensor.type));

  const reading = await db
    .selectFrom(table.as("t"))
    .selectAll()
    .where("t.device_id", "=", sensor.device_id)
    .where("t.sensor_id", "=", sensor.id)
    .orderBy("t.time", "desc")
    .limit(1)
    .executeTakeFirst();

  return reading ?? null;
}

export async function getSensorLastestReadingTime(
  sensor: Sensor,
): Promise<Date | null> {
  const reading = await getSensorLatestReading(sensor);

  return reading?.time ?? null;
}
