import z from "zod/v4";

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

export const $DeviceId = z.string();

export const $Device = z.object({
  id: $DeviceId,
  name: z.string(),
  type: $DeviceType,
  latitude: z.coerce.number().lte(90).gte(-90).nullish(),
  longitude: z.coerce.number().lte(180).gte(-180).nullish(),
  building: z.string().nullish(),
  room: z.string().nullish(),
  user_id: z.string().nullish(),
  is_public: z.coerce.boolean(),
});

export type Device = z.infer<typeof $Device>;
export type DeviceType = z.infer<typeof $DeviceType>;
