import { $Device, $DeviceType } from "./device";
import { $Sensor, $ZigbeeSensorType } from "./sensor";

export const $CreatableDeviceType = $DeviceType.exclude(["nemo_cloud"]);

export const $NewDevice = $Device
  .omit({
    user_id: true,
  })
  .extend({
    type: $CreatableDeviceType,
  });

export const $UpdateDevice = $NewDevice.omit({
  id: true,
  type: true,
});

export const $NewSensor = $Sensor
  .omit({
    device_id: true,
  })
  .extend({
    type: $ZigbeeSensorType,
  });

export const $UpdateSensor = $Sensor.pick({
  name: true,
});
