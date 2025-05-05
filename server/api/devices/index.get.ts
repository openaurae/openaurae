import { $DeviceType, type Device, type DeviceType } from "#shared/types";
import { z } from "zod";
import { db } from "~/server/database";
import { getUserId, hasPermission, validateRequest } from "~/server/utils";

const $Filter = z.object({
  type: $DeviceType.optional(),
});

export default defineEventHandler(async (event) => {
  const { type } = await validateRequest(event, "query", $Filter);
  const userId = getUserId(event);

  let devices: Device[] = [];

  if (!userId) {
    devices = await getPublicDevices(type);
  } else if (hasPermission(event, "readAll")) {
    devices = await getDevices(type);
  } else {
    devices = await getUserDevices(userId, type);
  }

  return await Promise.all(
    devices.map(async (device) => {
      const sensors = await deviceSensors(device.id);
      const status = calculateDeviceDailyStatus(sensors);
      return {
        ...device,
        ...status,
        sensors,
      };
    }),
  );
});

async function getPublicDevices(type?: DeviceType): Promise<Device[]> {
  let query = db
    .selectFrom("devices")
    .selectAll()
    .where("is_public", "is", true);

  if (type) {
    query = query.where("type", "=", type);
  }

  return await query.execute();
}

async function getUserDevices(
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

async function getDevices(type?: DeviceType): Promise<Device[]> {
  let query = db.selectFrom("devices").selectAll();

  if (type) {
    query = query.where("type", "=", type);
  }

  return await query.execute();
}
