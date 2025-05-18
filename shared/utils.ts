import { secondsToMilliseconds, toDate } from "date-fns";

export function secondsToDate(seconds: number): Date {
  return toDate(secondsToMilliseconds(seconds));
}
