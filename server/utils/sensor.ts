import type { DailyReadingStatus, Sensor } from "#shared/types";
import { max as maxDate } from "date-fns";
import { sql } from "kysely";
import { db } from "~/server/database";

export async function getSensorsByDeviceId(
  deviceId: string,
): Promise<Sensor[]> {
  return await db
    .selectFrom("sensors")
    .selectAll()
    .where("device_id", "=", deviceId)
    .execute();
}

export async function getSensorLastUpdateTime(
  sensor: Sensor,
): Promise<Date | null> {
  const table = `readings_${sensor.type}`;
  const result = await sql<{ max_time: Date | null }>`
  select
   	max(time) as max_time
  from
 	  ${sql.table(table)}
  where
   	device_id = ${sensor.device_id}
   	and sensor_id = ${sensor.id};
  `.execute(db);

  return result.rows[0].max_time;
}

export async function countSensorReadingsToday(
  sensor: Sensor,
  startOfToday: Date,
): Promise<number> {
  const table = `readings_${sensor.type}`;
  const result = await sql<{ count: number }>`
  select
   	count(*) as count
  from
 	  ${sql.table(table)}
  where
   	device_id = ${sensor.device_id}
   	and sensor_id = ${sensor.id}
    and time > ${startOfToday.toISOString()};
  `.execute(db);

  return result.rows[0].count;
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
