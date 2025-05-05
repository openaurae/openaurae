import { type Device, type DeviceType, DeviceTypes } from "#shared/types";

export function formatDeviceType(type: DeviceType) {
  switch (type) {
    case DeviceTypes.AIR_QUALITY:
      return "AQ Box";
    case DeviceTypes.ZIGBEE:
      return "Zigbee";
    case DeviceTypes.NEMO_CLOUD:
      return "Nemo";
    default:
      return "Unknown";
  }
}

export function isNemoCloudDevice(device: Device): boolean {
  return device.type === DeviceTypes.NEMO_CLOUD;
}
