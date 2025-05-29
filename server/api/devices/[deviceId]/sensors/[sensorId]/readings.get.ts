import { subDays } from "date-fns";
import { z } from "zod/v4";
import { validateRequest, validateSensorId } from "~/server/utils";

const $Query = z.object({
  start: z.coerce
    .date()
    .optional()
    .default(() => subDays(new Date(), 1)),
  end: z.coerce
    .date()
    .optional()
    .default(() => new Date()),
});

export default defineEventHandler(async (event) => {
  const { start, end } = await validateRequest(event, "query", $Query);
  const sensor = await validateSensorId(event);

  return await getSensorReadings(sensor, start, end);
});
