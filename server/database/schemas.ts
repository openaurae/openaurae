import z from "zod";

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
