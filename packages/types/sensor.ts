import { z } from "zod";

import type { DeviceType } from "./device";
import { nonEmptyStringSchema } from "./helper";

/**
 * All sensor types
 *
 * - Each AQ box has only one `ptqs1005` sensor and one `pms5003st` sensor.
 * - Zigbee devices have `zigbee_*` sensors and may contain multiple sensors of same type.
 * - Nemo Cloud devices have only `nemo_cloud` sensors.
 */
export const SensorTypeSchema = z.enum([
	"ptqs1005",
	"pms5003st",
	"zigbee_temp",
	"zigbee_contact",
	"zigbee_power",
	"zigbee_occupancy",
	"zigbee_vibration",
	"nemo_cloud",
]);

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

/**
 * Possible sensor types of each device type.
 */
export const deviceSensorTypes: Record<DeviceType, SensorType[]> = {
	air_quality: ["ptqs1005", "pms5003st"],
	zigbee: [
		"zigbee_temp",
		"zigbee_occupancy",
		"zigbee_contact",
		"zigbee_vibration",
		"zigbee_power",
	],
	nemo_cloud: ["nemo_cloud"],
};
