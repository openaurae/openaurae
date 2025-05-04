import z from "zod";

export const $DeviceType = z.enum(["air_quality", "zigbee", "nemo_cloud"], {
  message: "Invalid device type",
});

export const $Device = z.object({
  id: z.string(),
  name: z.string(),
  type: $DeviceType,
  latitude: z.coerce.number().nullish(),
  longitude: z.coerce.number().nullish(),
  building: z.string().nullish(),
  room: z.string().nullish(),
  user_id: z.string().nullish(),
  is_public: z.coerce.boolean(),
});

export type Device = z.infer<typeof $Device>;
export type DeviceType = z.infer<typeof $DeviceType>;
