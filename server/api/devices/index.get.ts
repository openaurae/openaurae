import {
  $DeviceType,
  type Device,
  type DeviceWithSensorsAndStatus,
} from "#shared/types";
import { z } from "zod";
import {
  aggregateSensorDailyStatus,
  getDeviceSensorsWithStatus,
  getDevices,
  getPublicDevices,
  getUserDevices,
  getUserId,
  hasPermission,
  sortDevicesByLastUpdateTimeDesc,
  validateRequest,
} from "~/server/utils";

const $QueryParams = z.object({
  type: $DeviceType.optional(),
  startOfToday: z.coerce.date(),
});

export default defineEventHandler(
  async (event): Promise<DeviceWithSensorsAndStatus[]> => {
    const { type, startOfToday } = await validateRequest(
      event,
      "query",
      $QueryParams,
    );
    const userId = getUserId(event);

    let devices: Device[] = [];

    if (!userId) {
      devices = await getPublicDevices(type);
    } else if (hasPermission(event, "readAll")) {
      devices = await getDevices(type);
    } else {
      devices = await getUserDevices(userId, type);
    }

    const devicesWithStatus = await Promise.all(
      devices.map(async (device) => {
        const sensors = await getDeviceSensorsWithStatus(
          device.id,
          startOfToday,
        );
        const status = aggregateSensorDailyStatus(sensors);
        return {
          ...device,
          ...status,
          sensors,
        };
      }),
    );

    sortDevicesByLastUpdateTimeDesc(devicesWithStatus);
    return devicesWithStatus;
  },
);
