import { z } from "zod";
import { emptyStringToNull, nonEmptyStringSchema } from "./helper";

/**
 * All device types.
 *
 * - `air_quality`: AQ boxes containing a `pms5003st` sensor and a `ptqs1005` sensor.
 * - `zigbee`: Zigbee devices containing `zigbee_*` sensors.
 * - `nemo_cloud`: devices which upload readings to the [Nemo Cloud server](https://nemocloud.com/)
 *  and the [S5 Nemo Cloud server](https://s5.nemocloud.com/).
 *
 * Use `.enum` to specify a device type.
 *
 * ```typescript
 *	DeviceTypeSchema.enum.zigbee; // "zigbee"
 * ```
 *
 * Use `.options` to get all device types.
 *
 * ```typescript
 *    DeviceTypeSchema.options; // ["nemo_cloud", "air_quality", "zigbee"]
 * ```
 *
 * @see [Zod enums](https://zod.dev/?id=zod-enums)
 */
export const DeviceTypeSchema = z.enum(["air_quality", "zigbee", "nemo_cloud"]);

export type DeviceType = z.infer<typeof DeviceTypeSchema>;

/**
 * Schema of device records in the database.
 */
export const DeviceSchema = z.object({
	id: nonEmptyStringSchema,
	name: nonEmptyStringSchema.max(50),
	type: DeviceTypeSchema,
	user_id: nonEmptyStringSchema.nullable(),
	last_record: z.coerce
		.date()
		.nullish()
		.describe("the latest reading time among all sensors"),
	latitude: z.preprocess(
		emptyStringToNull,
		z.coerce.number().lte(90).gte(-90).nullish(),
	),
	longitude: z.preprocess(
		emptyStringToNull,
		z.coerce.number().lte(180).gte(-180).nullish(),
	),
	building: z.string().nullish(),
	room: z.string().nullish(),
});

export type Device = z.infer<typeof DeviceSchema>;
