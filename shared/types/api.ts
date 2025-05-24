import z from "zod/v4";

import { $Device } from "./device";
import { $Reading } from "./reading";
import { $Sensor } from "./sensor";

export const $DailyReadingStatus = z.object({
  daily_reading_count: z.number(),
  last_update: z.coerce.date().nullable(),
});

export type DailyReadingStatus = z.infer<typeof $DailyReadingStatus>;

export const $GetSensorResult = z.object({
  ...$Sensor.shape,
  ...$DailyReadingStatus.shape,
  latest_reading: $Reading,
});

export type GetSensorResult = z.infer<typeof $GetSensorResult>;

export const $GetDeviceResult = $Device.merge($DailyReadingStatus).extend({
  sensors: $GetSensorResult.array(),
});

export type GetDeviceResult = z.infer<typeof $GetDeviceResult>;
