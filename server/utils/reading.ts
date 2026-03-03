import type { Reading, Sensor, SensorReading, SensorType } from "#shared/types";
import type { Transaction } from "kysely";
import { sql } from "kysely";

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
    .select(({ fn }) => [fn.countAll().as("count")])
    .where("t.device_id", "=", sensor.device_id)
    .where("t.sensor_id", "=", sensor.id)
    .where("t.time", ">=", start)
    .executeTakeFirst();

  return Number(result?.count ?? 0);
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

type SensorStats = {
  sensor_id: string;
  daily_count: number;
  latest_reading: Reading | null;
};

/**
 * Batch query sensor stats (daily count + latest reading) for a device.
 * Groups sensors by type and queries each table once, reducing N+1 to O(sensor_types).
 */
export async function batchGetSensorStats(
  sensors: Sensor[],
  startOfToday: Date,
): Promise<Map<string, SensorStats>> {
  const result = new Map<string, SensorStats>();

  // Group sensors by type
  const sensorsByType = new Map<SensorType, Sensor[]>();
  for (const sensor of sensors) {
    const group = sensorsByType.get(sensor.type) ?? [];
    group.push(sensor);
    sensorsByType.set(sensor.type, group);
  }

  // Query each table once
  for (const [sensorType, typedSensors] of sensorsByType) {
    if (typedSensors.length === 0) continue;
    const deviceId = typedSensors[0]!.device_id;
    const sensorIds = typedSensors.map((s) => s.id);
    const table = readingTable(sensorType);

    // Get daily counts
    const counts = await db
      .selectFrom(db.dynamic.table(table).as("t"))
      .select(["t.sensor_id", ({ fn }) => fn.countAll().as("count")])
      .where("t.device_id", "=", deviceId)
      .where("t.sensor_id", "in", sensorIds)
      .where("t.time", ">=", startOfToday)
      .groupBy("t.sensor_id")
      .execute();

    const countMap = new Map(counts.map((c) => [c.sensor_id, Number(c.count)]));

    // Get latest readings using DISTINCT ON (PostgreSQL specific)
    const latestReadings = await sql<Reading>`
      SELECT DISTINCT ON (sensor_id) *
      FROM ${sql.table(table)}
      WHERE device_id = ${deviceId}
        AND sensor_id = ANY(${sensorIds})
      ORDER BY sensor_id, time DESC
    `.execute(db);

    const readingMap = new Map(
      latestReadings.rows.map((r) => [r.sensor_id, r]),
    );

    // Combine results
    for (const sensor of typedSensors) {
      result.set(sensor.id, {
        sensor_id: sensor.id,
        daily_count: countMap.get(sensor.id) ?? 0,
        latest_reading: readingMap.get(sensor.id) ?? null,
      });
    }
  }

  return result;
}
