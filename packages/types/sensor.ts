import { z } from "zod";

import type { DeviceType } from "./device";
import { nonEmptyStringSchema } from "./helper";

export const AirQualitySensorTypeSchema = z.enum(["ptqs1005", "pms5003st"]);

/**
 * Each AQ box has only one `ptqs1005` sensor and one `pms5003st` sensor.
 */
export type AirQualitySensorType = z.infer<typeof AirQualitySensorTypeSchema>;

export const ZigbeeSensorTypeSchema = z.enum([
	"zigbee_temp",
	"zigbee_occupancy",
	"zigbee_contact",
	"zigbee_vibration",
	"zigbee_power",
]);

/**
 * Zigbee devices have `zigbee_*` sensors and may contain multiple sensors of same type.
 */
export type ZigbeeSensorType = z.infer<typeof ZigbeeSensorTypeSchema>;

export const NemoCloudSensorTypeSchema = z.enum(["nemo_cloud"]);

/**
 * Information of Nemo Cloud devices are fetched from the API.
 * Since the API doesn't include sensor type, we use `nemo_cloud` for all devices.
 */
export type NemoCloudSensorType = z.infer<typeof NemoCloudSensorTypeSchema>;

export const SensorTypeSchema = z.union([
	AirQualitySensorTypeSchema,
	ZigbeeSensorTypeSchema,
	NemoCloudSensorTypeSchema,
]);

/**
 * All sensor types
 */
export type SensorType = z.infer<typeof SensorTypeSchema>;

/**
 * Schema of sensor records in the database.
 *
 * Note: primary key of the sensor table is `((device), id)`
 * because sensor id is not unique (see below).
 *
 * - For AQ boxes containing a `pms5003st` sensor and a `ptqs1005` sensor,
 * sensor ids are always `pms5003st` and `ptqs1005`.
 * So sensor id is not unique across AQ boxes.
 * - For Zigbee devices, sensor ids are sensors' serial numbers.
 * - For Nemo Cloud devices, sensor ids are fetched from the sensor API.
 */
export const SensorSchema = z.object({
	device: nonEmptyStringSchema.describe("device id"),
	id: nonEmptyStringSchema,
	type: SensorTypeSchema,
	name: z.string().trim().nullish(),
	comments: z.string().trim().nullish(),
	last_record: z.coerce
		.date()
		.nullish()
		.describe("time of the latest sensor reading"),
});

export type Sensor = z.infer<typeof SensorSchema>;

export const SensorTypesSchema = SensorTypeSchema.array();

/**
 * Possible sensor types of each device type.
 */
export const deviceSensorTypes: Record<DeviceType, SensorType[]> = {
	air_quality: AirQualitySensorTypeSchema.options,
	zigbee: ZigbeeSensorTypeSchema.options,
	nemo_cloud: NemoCloudSensorTypeSchema.options,
};
