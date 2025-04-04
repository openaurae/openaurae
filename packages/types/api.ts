import { z } from "zod";

import { type Device, DeviceSchema, DeviceTypeSchema } from "./device";
import { nonEmptyStringSchema } from "./helper";
import { type Sensor, SensorSchema, ZigbeeSensorTypeSchema } from "./sensor";

export const GetDevicesSchema = z.object({
	type: DeviceTypeSchema.nullish().describe("filter by device type"),
	building: nonEmptyStringSchema.nullish().describe("filter by building"),
});

export const AddDeviceSchema = DeviceSchema.pick({
	id: true,
	name: true,
	type: true,
	latitude: true,
	longitude: true,
});

export type AddDevice = z.infer<typeof AddDeviceSchema>;

export const UpdateDeviceSchema = DeviceSchema.pick({
	name: true,
	building: true,
	room: true,
	latitude: true,
	longitude: true,
});

export type UpdateDevice = z.infer<typeof UpdateDeviceSchema>;

export const AddZigbeeSensorSchema = SensorSchema.pick({
	id: true,
	name: true,
}).extend({
	type: ZigbeeSensorTypeSchema,
});

export type AddZigbeeSensor = z.infer<typeof AddZigbeeSensorSchema>;

export const UpdateSensorSchema = SensorSchema.pick({
	name: true,
});

export type UpdateSensor = z.infer<typeof UpdateSensorSchema>;

export type DeviceWithSensors = Device & {
	sensors: Sensor[];
};
