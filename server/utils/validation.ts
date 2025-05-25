import { $DeviceId, type Device } from "#shared/types";
import { formatError } from "#shared/utils";
import type { H3Event } from "h3";
import { type ZodSchema, z } from "zod/v4";

import { getDeviceById, isDeviceOwner } from "./device";

const Validators = {
  body: readValidatedBody,
  query: getValidatedQuery,
  params: getValidatedRouterParams,
} as const;

export async function validateRequest<T>(
  event: H3Event,
  target: keyof typeof Validators,
  schema: ZodSchema<T>,
): Promise<T> {
  const validator = Validators[target];
  const { error, data } = await validator(event, schema.safeParseAsync);

  if (error) {
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

type DeviceApiParam = z.infer<typeof $DeviceApiParam>;

export async function validateDeviceId(event: H3Event): Promise<Device> {
  const { deviceId } = await validateRequest<DeviceApiParam>(
    event,
    "params",
    $DeviceApiParam,
  );

  const device = await getDeviceById(deviceId);

  if (!device) {
    throw createError({
      statusCode: 404,
      message: "Device not found",
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
    message: "Permission required",
  });
}
