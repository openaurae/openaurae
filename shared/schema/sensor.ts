import * as z from "zod";

import { $DeviceId } from "./device";

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

export const $ZigbeeSensorType = $SensorType.extract([
  "zigbee_temp",
  "zigbee_contact",
  "zigbee_occupancy",
  "zigbee_vibration",
  "zigbee_power",
]);

export const $SensorId = z
  .string()
  .min(1, { message: "Sensor ID cannot be empty." })
  .max(32, { message: "Sensor ID must be at most 32 characters long." })
  .regex(/^[a-zA-Z0-9_:]+$/, {
    message:
      "Sensor ID can only contain letters, numbers, underscores and colons.",
  });

export const $SensorName = z
  .string()
  .min(1, { message: "Sensor name cannot be empty." })
  .max(32, { message: "Sensor name must be at most 32 characters long." })
  .regex(/^[a-zA-Z0-9_:]+$/, {
    message:
      "Sensor name can only contain letters, numbers, underscores and colons.",
  });

export const $Sensor = z.object({
  id: $SensorId,
  device_id: $DeviceId,
  name: $SensorName,
  type: $SensorType,
});
