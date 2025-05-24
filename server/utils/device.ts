import type {
  Device,
  DeviceType,
  GetDeviceResult,
  GetSensorResult,
} from "#shared/types";
import { compareDesc } from "date-fns";
import { db } from "~/server/database";

import { countSensorReadings, getSensorLastestReadingTime } from "./reading";
import { getSensorsByDeviceId } from "./sensor";

export async function insertDevice(device: Device): Promise<void> {
  await db.insertInto("devices").values(device).execute();
}

export async function upsertDevice(device: Device): Promise<void> {
  await db
    .insertInto("devices")
    .values(device)
    .onConflict((oc) => oc.column("id").doUpdateSet(device))
    .execute();
}

export async function getDevices(type?: DeviceType): Promise<Device[]> {
  let query = db.selectFrom("devices").selectAll();

  if (type) {
    query = query.where("type", "=", type);
  }

  return await query.execute();
}

export async function getPublicDevices(type?: DeviceType): Promise<Device[]> {
  let query = db
    .selectFrom("devices")
    .selectAll()
    .where("is_public", "is", true);

  if (type) {
    query = query.where("type", "=", type);
  }

  return await query.execute();
}

export async function getUserDevices(
  userId: string,
  type?: DeviceType,
): Promise<Device[]> {
  let query = db
    .selectFrom("devices")
    .selectAll()
    .where((eb) =>
      eb.or([eb("is_public", "is", true), eb("user_id", "=", userId)]),
    );

  if (type) {
    query = query.where("type", "=", type);
  }

  return await query.execute();
}

export async function getDeviceSensorsWithStatus(
  deviceId: string,
  startOfToday: Date,
): Promise<GetSensorResult[]> {
  const sensors = await getSensorsByDeviceId(deviceId);

  return await Promise.all(
    sensors.map(async (sensor) => {
      const latestReading = await getSensorLatestReading(sensor);

      return {
        ...sensor,
        daily_reading_count: await countSensorReadings(sensor, startOfToday),
        latest_reading: latestReading,
        last_update: latestReading?.time || null,
      };
    }),
  );
}

export function sortDevicesByLastUpdateTimeDesc(devices: GetDeviceResult[]) {
  devices.sort((a, b) => {
    if (!a.last_update && !b.last_update) {
      return a.name < b.name ? -1 : 1;
    }

    if (!a.last_update) {
      return 1;
    }

    if (!b.last_update) {
      return -1;
    }

    return compareDesc(a.last_update, b.last_update);
  });
}
