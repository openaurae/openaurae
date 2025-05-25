import { $NewSensor, DeviceTypes } from "#shared/types";
import { validateRequest } from "~/server/utils";

export default defineEventHandler(async (event) => {
  const device = await validateDeviceId(event);

  if (device.type !== DeviceTypes.ZIGBEE) {
    throw createError({
      statusCode: 400,
      statusText: "Sensor creation is not allowed",
    });
  }

  const newSensor = await validateRequest(event, "body", $NewSensor);
  await requireUniqueId(device.id, newSensor.id);

  await upsertSensor({ ...newSensor, device_id: device.id });

  setResponseStatus(event, 201, "Sensor created successfully");
});

async function requireUniqueId(deviceId: string, sensorId: string) {
  const sensor = await getSensorById(deviceId, sensorId);

  if (sensor) {
    throw createError({
      statusCode: 409,
      statusText: "Sensor ID is already in use",
    });
  }
}
