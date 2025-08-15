import { $ZigbeeSensorType, SensorTypes } from "#shared/schema";
import type { DeviceType, Sensor, SensorType } from "#shared/types";

export function isZigbeeSensor(sensor: Sensor): boolean {
  const result = $ZigbeeSensorType.safeParse(sensor.type);

  return result.success;
}

export function sensorDeviceType(sensorType: SensorType): DeviceType {
  switch (sensorType) {
    case SensorTypes.NEMO_CLOUD:
      return "nemo_cloud";
    case SensorTypes.AQ_PMS:
    case SensorTypes.AQ_PTQS:
      return "air_quality";
    case SensorTypes.ZG_CONTACT:
    case SensorTypes.ZG_TEMP:
    case SensorTypes.ZG_POWER:
    case SensorTypes.ZG_OCCUPANCY:
    case SensorTypes.ZG_VIBRATION:
      return "zigbee";
  }
}
