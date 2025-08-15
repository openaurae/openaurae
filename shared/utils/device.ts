import { DeviceTypes } from "#shared/schema";
import type { Device } from "#shared/types";

export function isNemoCloudDevice(device?: Device | null): boolean {
  return device?.type === DeviceTypes.NEMO_CLOUD;
}

export function isZigbeeDevice(device?: Device | null): boolean {
  return device?.type === DeviceTypes.ZIGBEE;
}
