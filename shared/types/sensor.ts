import z from "zod/v4";

export const SensorTypes = {
  AQ_PTQS: "ptqs1005",
  AQ_PMS: "pms5003st",
  ZG_TEMP: "zigbee_temp",
  ZG_OCCUPANCY: "zigbee_occupancy",
  ZG_CONTACT: "zigbee_contact",
  ZG_VIBRATION: "zigbee_vibration",
  ZG_POWER: "zigbee_power",
  NEMO_CLOUD: "nemo_cloud",
} as const;

export const $SensorType = z.enum([
  SensorTypes.AQ_PTQS,
  SensorTypes.AQ_PMS,
  SensorTypes.ZG_TEMP,
  SensorTypes.ZG_OCCUPANCY,
  SensorTypes.ZG_CONTACT,
  SensorTypes.ZG_VIBRATION,
  SensorTypes.ZG_POWER,
  SensorTypes.NEMO_CLOUD,
]);

export const $SensorId = z.string();

export const $Sensor = z.object({
  id: $SensorId,
  device_id: z.string(),
  name: z.string(),
  type: $SensorType,
});

export type Sensor = z.infer<typeof $Sensor>;
export type SensorType = z.infer<typeof $SensorType>;
