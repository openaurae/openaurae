import { blankToNull } from "#shared/utils";
import * as z from "zod";

export const DeviceTypes = {
  AIR_QUALITY: "air_quality",
  ZIGBEE: "zigbee",
  NEMO_CLOUD: "nemo_cloud",
} as const;

export const $DeviceType = z.enum([
  DeviceTypes.AIR_QUALITY,
  DeviceTypes.ZIGBEE,
  DeviceTypes.NEMO_CLOUD,
]);

export const $DeviceId = z
  .string()
  .min(1, { message: "Device ID cannot be empty." })
  .max(32, { message: "Device ID must be at most 32 characters long." })
  .regex(/^[a-zA-Z0-9_:-]+$/, {
    message:
      "Device ID can only contain letters, numbers, underscores, hyphens and colons.",
  });

export const $DeviceName = z
  .string()
  .min(1, { message: "Device name cannot be empty." })
  .max(32, { message: "Device name must be at most 32 characters long." })
  .regex(/^[a-zA-Z0-9_:-]+$/, {
    message:
      "Device name can only contain letters, numbers, underscores, hyphens and colons.",
  });

export const $Device = z.object({
  id: $DeviceId,
  name: $DeviceName,
  type: $DeviceType,
  latitude: z.preprocess(
    blankToNull,
    z.coerce.number().lte(90).gte(-90).nullish(),
  ),
  longitude: z.preprocess(
    blankToNull,
    z.coerce.number().lte(180).gte(-180).nullish(),
  ),
  building: z.preprocess(blankToNull, z.string().nullish()),
  room: z.preprocess(blankToNull, z.string().nullish()),
  user_id: z.string().nullish(),
  is_public: z.coerce.boolean().default(false),
});
