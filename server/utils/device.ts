import type { Device, DeviceType, GetSensorResult } from "#shared/types";
import { isNotNil } from "#shared/utils";
import { db } from "~/server/database";

import { countSensorReadings } from "./reading";
import { getSensorsByDeviceId } from "./sensor";

export function isDeviceOwner(device: Device, userId: unknown): boolean {
  return isNotNil(device.user_id) && device.user_id === userId;
}

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

export async function getDeviceById(deviceId: string): Promise<Device | null> {
  const device = await db
    .selectFrom("devices")
    .where("id", "=", deviceId)
    .selectAll()
    .executeTakeFirst();

  return device ?? null;
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
