import type { z } from "zod";

import { $Device } from "./device";
import { $Sensor } from "./sensor";
import { $DailyReadingStatus } from "./status";

export const $SensorWithStatus = $Sensor.merge($DailyReadingStatus);

export type SensorWithStatus = z.infer<typeof $SensorWithStatus>;

export const $DeviceWithSensorsAndStatus = $Device
  .merge($DailyReadingStatus)
  .extend({
    sensors: $SensorWithStatus.array(),
  });

export type DeviceWithSensorsAndStatus = z.infer<
  typeof $DeviceWithSensorsAndStatus
>;
