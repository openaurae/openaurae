import z from "zod";

export const $SensorType = z.enum([
  "ptqs1005",
  "pms5003st",
  "zigbee_temp",
  "zigbee_occupancy",
  "zigbee_contact",
  "zigbee_vibration",
  "zigbee_power",
  "nemo_cloud",
]);

export const $Sensor = z.object({
  id: z.string(),
  device_id: z.string(),
  name: z.string(),
  type: $SensorType,
});

export type Sensor = z.infer<typeof $Sensor>;
export type SensorType = z.infer<typeof $SensorType>;
