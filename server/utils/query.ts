import type { ReadingStatus, Sensor } from "#shared/types";
import { max as maxDate } from "date-fns";
import { sql } from "kysely";
import { db } from "~/server/database";

export async function deviceSensors(
  deviceId: string,
): Promise<(Sensor & ReadingStatus)[]> {
  const sensors = await db
    .selectFrom("sensors")
    .selectAll()
    .where("device_id", "=", deviceId)
    .execute();

  return await Promise.all(
    sensors.map(async (sensor) => {
      return {
        ...sensor,
        readings_today: await sensorDailyReadingCount(sensor),
        updated_at: await sensorLastUpdateTime(sensor),
      };
    }),
  );
}

export function calculateDeviceDailyStatus(
  sensorStats: ReadingStatus[],
): ReadingStatus {
  let total = 0;
  let latest = null;

  for (const { readings_today, updated_at } of sensorStats) {
    total += readings_today;
    if (updated_at) {
      latest = latest ? maxDate([latest, updated_at]) : updated_at;
    }
  }

  return { readings_today: total, updated_at: latest };
}

export async function sensorDailyReadingCount(sensor: Sensor): Promise<number> {
  const table = `readings_${sensor.type}`;
  const result = await sql<{ count: number }>`
  select
   	count(*) as count
  from
 	  ${sql.table(table)}
  where
   	device_id = ${sensor.device_id}
   	and sensor_id = ${sensor.id}
    and time::date = CURRENT_DATE;
  `.execute(db);

  return result.rows[0].count;
}

export async function sensorLastUpdateTime(
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
