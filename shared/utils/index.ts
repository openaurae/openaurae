import {
  type DateArg,
  compareDesc,
  millisecondsToSeconds,
  secondsToMilliseconds,
  toDate,
} from "date-fns";
import { minTime } from "date-fns/constants";

export * from "./format";
export * from "./device";
export * from "./sensor";

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

export function blankToNull(value: unknown) {
  return value === "" ? null : value;
}

export function isNil(value: unknown): boolean {
  return value === null || value === undefined;
}

export function isNotNil(value: unknown): boolean {
  return !isNil(value);
}
