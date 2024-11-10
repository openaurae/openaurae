import { z } from "zod";

import { type Device, DeviceSchema, DeviceTypeSchema } from "./device";
import { nonEmptyStringSchema } from "./helper";
import type { Sensor } from "./sensor";

export const GetDevicesSchema = z.object({
	type: DeviceTypeSchema.nullish().describe("filter by device type"),
	building: nonEmptyStringSchema.nullish().describe("filter by building"),
});

export const UpdateDeviceSchema = DeviceSchema.pick({
	name: true,
	building: true,
	room: true,
	latitude: true,
	longitude: true,
});

export type UpdateDevice = z.infer<typeof UpdateDeviceSchema>;

export type DeviceWithSensors = Device & {
	sensors: Sensor[];
};
