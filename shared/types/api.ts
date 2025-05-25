import z from "zod/v4";

import { $Device, $DeviceType } from "./device";
import { $Reading } from "./reading";
import { $Sensor, $ZigbeeSensorType } from "./sensor";

export const $DailyReadingStatus = z.object({
  daily_reading_count: z.number(),
  last_update: z.coerce.date().nullable(),
});

export type DailyReadingStatus = z.infer<typeof $DailyReadingStatus>;

export const $GetSensorResult = z.object({
  ...$Sensor.shape,
  ...$DailyReadingStatus.shape,
  // TODO: $Reading treats PMS readings as PTQS readings
  latest_reading: $Reading.nullable(),
});

export type GetSensorResult = z.infer<typeof $GetSensorResult>;

export const $GetDeviceResult = z.object({
  ...$Device.shape,
  ...$DailyReadingStatus.shape,
  sensors: $GetSensorResult.array(),
});

export type GetDeviceResult = z.infer<typeof $GetDeviceResult>;

export const $CreatableDeviceType = $DeviceType.exclude(["nemo_cloud"]);

export const $NewDevice = $Device
  .omit({
    user_id: true,
  })
  .extend({
    type: $CreatableDeviceType,
  });

export type NewDevice = z.infer<typeof $NewDevice>;

export const $NewSensor = $Sensor
  .omit({
    device_id: true,
  })
  .extend({
    type: $ZigbeeSensorType,
  });

export type NewSensor = z.infer<typeof $NewSensor>;
