import { millisecondsToSeconds, secondsToMilliseconds, toDate } from "date-fns";

import { type DeviceType, type SensorType, SensorTypes } from "./types";

export function secondsToDate(seconds: number): Date {
  return toDate(secondsToMilliseconds(seconds));
}

export function dateToSeconds(date: Date): number {
  return millisecondsToSeconds(date.getTime());
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

export function isNil(value: unknown): boolean {
  return value === null || value === undefined;
}

export function isNotNil(value: unknown): boolean {
  return !isNil(value);
}
