import { z } from "zod";

import { type Device, DeviceTypeSchema } from "./device";
import { nonEmptyStringSchema } from "./helper";
import type { Sensor } from "./sensor";

export const GetDevicesSchema = z.object({
	type: DeviceTypeSchema.nullish().describe("filter by device type"),
	building: nonEmptyStringSchema.nullish().describe("filter by building"),
});

export type DeviceWithSensors = Device & {
	sensors: Sensor[];
};
