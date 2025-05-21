import { millisecondsToSeconds, secondsToMilliseconds, toDate } from "date-fns";

export function secondsToDate(seconds: number): Date {
  return toDate(secondsToMilliseconds(seconds));
}

export function dateToSeconds(date: Date): number {
  return millisecondsToSeconds(date.getTime());
}
