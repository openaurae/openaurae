import { $DeviceId, $SensorId, type Device, type Sensor } from "#shared/types";
import { formatError } from "#shared/utils";
import type { H3Event } from "h3";
import { z } from "zod/v4";

import { getDeviceById, isDeviceOwner } from "./device";

const Validators = {
  body: readValidatedBody,
  query: getValidatedQuery,
  params: getValidatedRouterParams,
} as const;

export async function validateRequest<Schema extends z.Schema>(
  event: H3Event,
  target: keyof typeof Validators,
  schema: Schema,
): Promise<z.output<Schema>> {
  const validator = Validators[target];
  const { error, data } = await validator(event, schema.safeParseAsync);

  if (error || data === undefined) {
    throw createError({
      statusCode: 400,
      message: formatError(error),
    });
  }

  return data;
}

const $DeviceApiParam = z.object({
  deviceId: $DeviceId,
});

export async function validateDeviceId(event: H3Event): Promise<Device> {
  const { deviceId } = await validateRequest(event, "params", $DeviceApiParam);

  const device = await getDeviceById(deviceId);

  if (!device) {
    throw createError({
      statusCode: 404,
      statusMessage: "Device not found",
    });
  }

  if (
    device.is_public ||
    hasPermission(event, "readAll") ||
    isDeviceOwner(device, getUserId(event))
  ) {
    return device;
  }

  throw createError({
    statusCode: 403,
    statusMessage: "Permission required",
  });
}

const $SensorApiParam = z.object({
  sensorId: $SensorId,
});

export async function validateSensorId(event: H3Event): Promise<Sensor> {
  const { sensorId } = await validateRequest(event, "params", $SensorApiParam);
  const device = await validateDeviceId(event);

  const sensor = await getSensorById(device.id, sensorId);

  if (!sensor) {
    throw createError({
      statusCode: 404,
      statusMessage: "Sensor not found",
    });
  }

  return sensor;
}
