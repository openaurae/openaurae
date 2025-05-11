import { z } from "zod";

export const $DailyReadingStatus = z.object({
  daily_reading_count: z.number(),
  last_update: z.coerce.date().nullable(),
});

export type DailyReadingStatus = z.infer<typeof $DailyReadingStatus>;
