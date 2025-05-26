import { subDays } from "date-fns";
import { z } from "zod/v4";
import { validateSensorId } from "~/server/utils";

const $Query = z.object({
  start: z.coerce.date().default(() => subDays(new Date(), 1)),
  end: z.coerce.date().default(() => new Date()),
});

export default defineEventHandler(async (event) => {
  const sensor = await validateSensorId(event);
  const { start, end } = await validateRequest(event, "query", $Query);

  return await getSensorReadings(sensor, start, end);
});
