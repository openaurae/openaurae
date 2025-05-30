import {
  type DateArg,
  compareDesc,
  millisecondsToSeconds,
  secondsToMilliseconds,
  toDate,
} from "date-fns";
import { minTime } from "date-fns/constants";
import { FetchError } from "ofetch";
import { ZodError, z } from "zod/v4";

import {
  $ZigbeeSensorType,
  type Device,
  type DeviceType,
  DeviceTypes,
  type Sensor,
  type SensorType,
  SensorTypes,
} from "./types";

export function isNemoCloudDevice(device?: Device | null): boolean {
  return device?.type === DeviceTypes.NEMO_CLOUD;
}

export function isZigbeeDevice(device?: Device | null): boolean {
  return device?.type === DeviceTypes.ZIGBEE;
}

export function isZigbeeSensor(sensor: Sensor): boolean {
  const result = $ZigbeeSensorType.safeParse(sensor.type);

  return result.success;
}

export function secondsToDate(seconds: number): Date {
  return toDate(secondsToMilliseconds(seconds));
}

export function dateToSeconds(date: Date): number {
  return millisecondsToSeconds(date.getTime());
}

export function sortedByTimeDesc<T>(
  items: T[],
  getTime: (item: T) => DateArg<Date> | null,
): T[] {
  return items.toSorted((a, b) =>
    compareDesc(getTime(a) ?? minTime, getTime(b) ?? minTime),
  );
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

export function formatError(error: unknown): string {
  if (error instanceof FetchError) {
    return error.statusText ?? `${error.statusCode} Unknown error`;
  }
  if (error instanceof ZodError) {
    return z.prettifyError(error);
  }
  if (error instanceof Error) {
    return error.message;
  }
  return "Unknown error";
}

export function blankToNull(value: unknown) {
  return value === "" ? null : value;
}

export function isNil(value: unknown): boolean {
  return value === null || value === undefined;
}

export function isNotNil(value: unknown): boolean {
  return !isNil(value);
}
