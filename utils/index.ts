import { type DeviceType, DeviceTypes, type SensorType } from "#shared/types";

export function formatDeviceType(type: DeviceType): string {
  switch (type) {
    case DeviceTypes.AIR_QUALITY:
      return "AQ Box";
    case DeviceTypes.ZIGBEE:
      return "Zigbee";
    case DeviceTypes.NEMO_CLOUD:
      return "NEMo";
    default:
      return "Unknown";
  }
}

export function formatSensorType(type: SensorType): string {
  switch (type) {
    case "nemo_cloud":
      return "NEMo";
    case "pms5003st":
      return "PMS";
    case "ptqs1005":
      return "PTQS";
    case "zigbee_contact":
      return "Contact";
    case "zigbee_occupancy":
      return "Occupancy";
    case "zigbee_power":
      return "Power";
    case "zigbee_temp":
      return "Temperature";
    case "zigbee_vibration":
      return "Vibration";
    default:
      return "Unknown";
  }
}
