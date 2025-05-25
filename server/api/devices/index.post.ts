import {
  $NewDevice,
  type Device,
  DeviceTypes,
  SensorTypes,
} from "#shared/types";
import { db } from "~/server/database";
import { requireLogin, validateRequest } from "~/server/utils";

export default defineEventHandler(async (event) => {
  const userId = requireLogin(event);
  const newDevice = await validateRequest(event, "body", $NewDevice);
  await requireUniqueIdAndName(newDevice.id, newDevice.name);

  const device = {
    ...newDevice,
    user_id: userId,
  };

  switch (device.type) {
    case DeviceTypes.AIR_QUALITY:
      await insertAirQualityDeviceAndSensors(device);
      break;
    case DeviceTypes.ZIGBEE:
      await upsertDevice(device);
      break;
    default:
      throw createError({
        status: 400,
        message: "Device creation is not supported",
      });
  }

  setResponseStatus(event, 201, "Device created successfully");
});

async function insertAirQualityDeviceAndSensors(device: Device) {
  await db.transaction().execute(async (tx) => {
    await tx.insertInto("devices").values(device).execute();
    await tx
      .insertInto("sensors")
      .values([
        {
          device_id: device.id,
          id: SensorTypes.AQ_PMS,
          type: SensorTypes.AQ_PMS,
          name: SensorTypes.AQ_PMS,
        },
        {
          device_id: device.id,
          id: SensorTypes.AQ_PTQS,
          type: SensorTypes.AQ_PTQS,
          name: SensorTypes.AQ_PTQS,
        },
      ])
      .execute();
  });
}

async function requireUniqueIdAndName(id: string, name: string) {
  const device = await db
    .selectFrom("devices")
    .select(["id"])
    .where((eb) => eb.or([eb("id", "=", id), eb("name", "=", name)]))
    .executeTakeFirst();

  if (device) {
    throw createError({
      statusCode: 409,
      statusText: "Device ID or name already exists",
    });
  }
}
