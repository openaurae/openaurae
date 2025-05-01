import z from "zod";

export const $DeviceType = z.enum(["air_quality", "zigbee", "nemo_cloud"], {
  message: "Invalid device type",
});

export const $Device = z.object({
  id: z.string(),
  name: z.string().nullish(),
  type: $DeviceType,
  latitude: z.coerce.number().nullish(),
  longitude: z.coerce.number().nullish(),
  building: z.string().nullish(),
  room: z.string().nullish(),
  user_id: z.string().nullish(),
  is_public: z.coerce.boolean(),
});

export const $SensorType = z.enum([
  "ptqs1005",
  "pms5003st",
  "zigbee_temp",
  "zigbee_occupancy",
  "zigbee_contact",
  "zigbee_vibration",
  "zigbee_power",
  "nemo_cloud",
]);

export type SensorType = z.infer<typeof $SensorType>;

const $ReadingPk = z.object({
  device_id: z.string(),
  sensor_id: z.string(),
  time: z.coerce.date(),
});

export const $Reading = {
  zigbee_temp: $ReadingPk.extend({
    temperature: z.number(),
    humidity: z.number(),
    battery: z.number(),
    voltage: z.number(),
  }),
  zigbee_occupancy: $ReadingPk.extend({
    occupancy: z.boolean(),
    illuminance: z.number(),
    battery: z.number(),
    voltage: z.number(),
  }),
  zigbee_contact: $ReadingPk.extend({
    contact: z.boolean(),
    battery: z.number(),
    voltage: z.number(),
  }),
  zigbee_power: $ReadingPk.extend({
    state: z.string().nullish(),
    power: z.number(),
    battery: z.number(),
    voltage: z.number(),
    consumption: z.number(),
  }),
  zigbee_vibration: $ReadingPk.extend({
    angle: z.number().nullish(),
    angle_x: z.number().nullish(),
    angle_y: z.number().nullish(),
    angle_z: z.number().nullish(),
    angle_x_absolute: z.number().nullish(),
    angle_y_absolute: z.number().nullish(),
    action: z.string().nullish(),
    battery: z.number(),
    voltage: z.number(),
  }),
  pms5003st: $ReadingPk.extend({
    cf_pm1: z.number(),
    cf_pm10: z.number(),
    cf_pm25: z.number(),
    pm1: z.number(),
    pm10: z.number(),
    pm25: z.number(),
    pm4: z.number().nullish(),
    pd05: z.number(),
    pd10: z.number(),
    pd25: z.number(),
    pd50: z.number(),
    pd100: z.number(),
    pd100g: z.number(),
    ch2o: z.number(),
    tmp: z.number(),
    rh: z.number(),
    pmv10: z.number(),
    pmv25: z.number(),
    pmv100: z.number(),
    pmv_total: z.number(),
    latitude: z.number().nullish(),
    longitude: z.number().nullish(),
  }),
  ptqs1005: $ReadingPk.extend({
    tvoc: z.number(),
    ch2o: z.number(),
    co2: z.number(),
    pm25: z.number(),
    tmp: z.number(),
    rh: z.number(),
    latitude: z.number().nullish(),
    longitude: z.number().nullish(),
  }),
};
