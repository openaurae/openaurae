import { Readable } from "node:stream";
import { zValidator } from "@hono/zod-validator";
import { stringify } from "csv";
import { eachDayOfInterval, format, startOfDay } from "date-fns";
import { Hono } from "hono";
import { stream } from "hono/streaming";
import { z } from "zod";

import { db } from "@openaurae/db";
import {
	sortDevicesByTimeDesc,
	sortReadingsByTimeAsc,
	sortSensorsByTimeDesc,
} from "@openaurae/lib";
import { mqttClient } from "@openaurae/mqtt";
import {
	AddZigbeeSensorSchema,
	GetDevicesSchema,
	type Reading,
	type Sensor,
	UpdateDeviceSchema,
} from "@openaurae/types";
import { HTTPException } from "hono/http-exception";
import { preSignedReadings } from "./export.ts";
import {
	type AuthVariables,
	validateDeviceId,
	validateSensorId,
} from "./middleware";

const devicesApi = new Hono<{ Variables: AuthVariables }>();

// Get user devices. Return all devices if user can access all resources.
devicesApi.get("/", zValidator("query", GetDevicesSchema), async (c) => {
	const { type, building } = c.req.valid("query");
	const { permissions, userId } = c.var;

	let devices = permissions.readAll
		? await db.getDevices()
		: await db.getDevicesByUserId(userId);

	if (type) {
		devices = devices.filter((device) => device.type === type);
	}

	if (building) {
		devices = devices.filter((device) => device.building === building);
	}

	return c.json(sortDevicesByTimeDesc(devices));
});

// Get user device by id.
devicesApi.get("/:deviceId", validateDeviceId({ from: "param" }), async (c) => {
	const device = c.var.device;
	const sensors = await db.getSensorsByDeviceId(device.id);

	return c.json({
		...device,
		sensors: sortSensorsByTimeDesc(sensors),
	});
});

// Update device by id.
devicesApi.put(
	"/:deviceId",
	validateDeviceId({ from: "param" }),
	zValidator("json", UpdateDeviceSchema),
	async (c) => {
		const device = {
			...c.var.device,
			...c.req.valid("json"),
		};

		await db.upsertDevice(device);

		return c.json(device);
	},
);

// Get device or sensor readings within a time range.
devicesApi.get(
	"/:deviceId/readings",
	validateDeviceId({ from: "param" }),
	validateSensorId({ from: "query", required: false }),
	zValidator(
		"query",
		z.object({
			sensorId: z.string().optional(),
			start: z.coerce.date().optional().default(startOfDay(new Date())),
			end: z.coerce.date().optional().default(new Date()),
			processed: z.coerce.boolean().optional().default(true),
		}),
	),
	async (c) => {
		const { sensor, device } = c.var;
		const { processed, start, end } = c.req.valid("query");

		const readings = sensor
			? await db.getSensorReadings({ sensor, processed, start, end })
			: await db.getDeviceReadings({
					deviceId: device.id,
					start,
					end,
					processed,
				});

		return c.json(sortReadingsByTimeAsc(readings));
	},
);

devicesApi.post(
	"/:deviceId/sensors",
	validateDeviceId({ from: "param" }),
	zValidator("json", AddZigbeeSensorSchema),
	async (c) => {
		const { device } = c.var;
		const { id: sensorId, type, name } = c.req.valid("json");

		const existed = await db.getSensorById(device.id, sensorId);

		if (existed) {
			throw new HTTPException(400, { message: "Sensor id already exists" });
		}

		await db.upsertSensor({
			device: device.id,
			id: sensorId,
			name,
			type,
		});

		return c.text("Sensor added.", 201);
	},
);

// Unpair Zigbee sensor.
devicesApi.delete(
	"/:deviceId/sensors/:sensorId",
	validateDeviceId({ from: "param" }),
	validateSensorId({ from: "param", required: true }),
	async (c) => {
		const sensor = c.var.sensor as Sensor;
		const { device } = c.var;

		if (device.type !== "zigbee") {
			throw new HTTPException(400, {
				message: "Only Zigbee sensors can be deleted.",
			});
		}

		await mqttClient.deleteZigbeeSensor(sensor);
		await db.deleteSensorById(sensor.device, sensor.id);

		return c.text("Sensor deleted", 200);
	},
);

export { devicesApi };
