import type { DailyReadingStatus, Sensor } from "#shared/types";
import { max as maxDate } from "date-fns";
import type { Transaction } from "kysely";

import { type Database, db } from "../database";

export async function upsertSensor(sensor: Sensor): Promise<Sensor> {
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

export async function updateSensorById(sensor: Sensor): Promise<void> {
  await db
    .updateTable("sensors")
    .set(sensor)
    .where("device_id", "=", sensor.device_id)
    .where("id", "=", sensor.id)
    .execute();
}

export async function deleteSensor(
  sensor: Sensor,
  tx?: Transaction<Database>,
): Promise<void> {
  const executor = tx ?? db;

  await executor
    .deleteFrom("sensors")
    .where("device_id", "=", sensor.device_id)
    .where("id", "=", sensor.id)
    .execute();
}

export async function insertSensor(sensor: Sensor): Promise<Sensor> {
  return await db
    .insertInto("sensors")
    .values(sensor)
    .returningAll()
    .executeTakeFirstOrThrow();
}

export async function getSensorById(
  deviceId: string,
  sensorId: string,
): Promise<Sensor | undefined> {
  return await db
    .selectFrom("sensors")
    .selectAll()
    .where("device_id", "=", deviceId)
    .where("id", "=", sensorId)
    .executeTakeFirst();
}

export async function getSensorsByDeviceId(
  deviceId: string,
): Promise<Sensor[]> {
  return await db
    .selectFrom("sensors")
    .selectAll()
    .where("device_id", "=", deviceId)
    .execute();
}

export function aggregateSensorDailyStatus(
  sensorStats: DailyReadingStatus[],
): DailyReadingStatus {
  let total = 0;
  let latest = null;

  for (const {
    daily_reading_count: readings_today,
    last_update: updated_at,
  } of sensorStats) {
    total += readings_today;
    if (updated_at) {
      latest = latest ? maxDate([latest, updated_at]) : updated_at;
    }
  }

  return { daily_reading_count: total, last_update: latest };
}
