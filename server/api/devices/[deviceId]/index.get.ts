import type { GetDeviceResult } from "#shared/types";
import { z } from "zod/v4";
import { getDeviceSensorsWithStatus, validateDeviceId } from "~/server/utils";

const $Query = z.object({
  startOfToday: z.coerce.date(),
});

export default defineEventHandler(async (event): Promise<GetDeviceResult> => {
  const { startOfToday } = await validateRequest(event, "query", $Query);
  const device = await validateDeviceId(event);

  const sensors = await getDeviceSensorsWithStatus(device.id, startOfToday);
  const status = aggregateSensorDailyStatus(sensors);

  return {
    ...device,
    ...status,
    sensors,
  };
});
