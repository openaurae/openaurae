import type { Device } from "#shared/types";
import { $DeviceId } from "#shared/types";
import type { H3Event } from "h3";
import { z } from "zod";
import { db } from "~/server/database";
import { calculateDeviceDailyStatus, hasPermission } from "~/server/utils";

const $Params = z.object({
  deviceId: $DeviceId,
});

export default defineEventHandler(async (event) => {
  const { deviceId } = await validateRequest(event, "params", $Params);

  const device = await validateDeviceId(deviceId);

  if (
    !device.is_public &&
    !hasPermission(event, "readAll") &&
    !isDeviceOwner(event, device)
  ) {
    throw createError({
      statusCode: 403,
      message: "Permission required",
    });
  }

  const sensors = await deviceSensors(device.id);
  const status = calculateDeviceDailyStatus(sensors);

  return {
    ...device,
    ...status,
    sensors,
  };
});

function isDeviceOwner(event: H3Event, device: Device): boolean {
  const userId = getUserId(event);
  return userId !== null && device.user_id === userId;
}

async function validateDeviceId(deviceId: string) {
  return await db
    .selectFrom("devices")
    .where("id", "=", deviceId)
    .selectAll()
    .executeTakeFirstOrThrow(() =>
      createError({
        statusCode: 404,
        message: "Device not found",
      }),
    );
}
