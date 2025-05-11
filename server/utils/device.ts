import type {
  Device,
  DeviceType,
  DeviceWithSensorsAndStatus,
  SensorWithStatus,
} from "#shared/types";
import { compareDesc } from "date-fns";
import { db } from "~/server/database";

import {
  countSensorReadingsToday,
  getSensorLastUpdateTime,
  getSensorsByDeviceId,
} from "./sensor";

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
): Promise<SensorWithStatus[]> {
  const sensors = await getSensorsByDeviceId(deviceId);

  return await Promise.all(
    sensors.map(async (sensor) => {
      return {
        ...sensor,
        daily_reading_count: await countSensorReadingsToday(
          sensor,
          startOfToday,
        ),
        last_update: await getSensorLastUpdateTime(sensor),
      };
    }),
  );
}

export function sortDevicesByLastUpdateTimeDesc(
  devices: DeviceWithSensorsAndStatus[],
) {
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
