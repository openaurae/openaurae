import { z } from "zod";

import { nonEmptyStringSchema } from "./helper";
import { SensorTypeSchema } from "./sensor";

/**
 * Schema of all metrics stored in the reading table.
 */
export const MetricsSchema = z.object({
	action: z.string().nullish(),
	angle: z.number().nullish(),
	angle_x: z.number().nullish(),
	angle_x_absolute: z.number().nullish(),
	angle_y: z.number().nullish(),
	angle_y_absolute: z.number().nullish(),
	angle_z: z.number().nullish(),
	battery: z.number().nullish(),
	cf_pm1: z.number().nullish(),
	cf_pm10: z.number().nullish(),
	cf_pm25: z.number().nullish(),
	ch2o: z.number().nullish().describe("Formaldehyde (µg/m3)"),
	co2: z.number().nullish(),
	consumption: z.number().nullish(),
	contact: z.boolean().nullish(),
	humidity: z.number().nullish(),
	illuminance: z.number().nullish(),
	lvocs: z
		.number()
		.nullish()
		.describe("Light Volatile Organic Compounds (ppb)"),
	occupancy: z.boolean().nullish(),
	pd05: z.number().nullish(),
	pd10: z.number().nullish(),
	pd100: z.number().nullish(),
	pd100g: z.number().nullish(),
	pd25: z.number().nullish(),
	pd50: z.number().nullish(),
	pm1: z.number().nullish().describe("Particulate matter 1 (µg/m3)"),
	pm10: z.number().nullish().describe("Particulate matter 10 (µg/m3)"),
	pm25: z.number().nullish().describe("Particulate matter 2.5 (µg/m3)"),
	pm4: z.number().nullish().describe("Particulate matter 4 (µg/m3)"),
	pmv10: z.number().nullish(),
	pmv100: z.number().nullish(),
	pmv25: z.number().nullish(),
	pmv_total: z.number().nullish(),
	pmvtotal: z.number().nullish(),
	power: z.number().nullish(),
	pressure: z.number().nullish().describe("Air Pressure (mb)"),
	state: z.string().nullish(),
	temperature: z.number().nullish().describe("Temperature (°C)"),
	tvoc: z.number().nullish().describe("Total Volatile Organic Compounds (ppm)"),
	voltage: z.number().nullish(),
});

export const MetricNameSchema = MetricsSchema.keyof();
export type MetricName = z.infer<typeof MetricNameSchema>;

/**
 * Schema of reading records stored in the database.
 */
export const ReadingSchema = MetricsSchema.extend({
	// PK
	device: z.string().describe("device id"),
	date: z.coerce.date(),
	// CK
	reading_type: SensorTypeSchema.describe("sensor type"),
	sensor_id: z.string().min(1),
	processed: z.boolean().describe("whether correction is applied"),
	time: z.coerce.date(),
	// other fields
	ip_address: z.string().nullish(),
	latitude: z.number().nullish(),
	longitude: z.number().nullish(),
});

export type Reading = z.infer<typeof ReadingSchema>;

/**
 * Schema of correction records stored in the database.
 *
 * An example of expression is `10.657*ch2o+43.259`
 * where `metric` is `ch2o`.
 */
export const CorrectionSchema = z.object({
	device: z.string().describe("device id"),
	reading_type: SensorTypeSchema,
	metric: MetricNameSchema,
	expression: nonEmptyStringSchema.describe(
		"formula applied to the metric value",
	),
});

export type Correction = z.infer<typeof CorrectionSchema>;
