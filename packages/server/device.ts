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
	AddDeviceSchema,
	AddZigbeeSensorSchema,
	GetDevicesSchema,
	type Reading,
	type Sensor,
	UpdateDeviceSchema,
	UpdateSensorSchema,
	deviceSensorTypes,
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

// Add device.
devicesApi.post("/", zValidator("json", AddDeviceSchema), async (c) => {
	const { userId } = c.var;
	const device = c.req.valid("json");

	if (device.type === "nemo_cloud") {
		throw new HTTPException(400, {
			message: "Cannot add Nemo Cloud devices.",
		});
	}

	const existed = await db.getDeviceById(device.id);

	if (existed) {
		throw new HTTPException(400, { message: `Device id was already used by a ${existed.type} device` });
	}

	await db.upsertDevice({
		...device,
		user_id: userId,
	});

	if (device.type === "air_quality") {
		for (const sensorType of deviceSensorTypes.air_quality) {
			await db.upsertSensor({
				device: device.id,
				id: sensorType,
				type: sensorType,
				name: sensorType,
			});
		}
	}

	return c.text("Device added.", 201);
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

		return c.text("Device updated.");
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
			throw new HTTPException(400, { message: `Sensor id is already used by a ${existed.type} sensor` });
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

// Get device sensor by id.
devicesApi.get(
	"/:deviceId/sensors/:sensorId",
	validateDeviceId({ from: "param" }),
	validateSensorId({ from: "param", required: true }),
	async (c) => {
		const sensor = c.var.sensor as Sensor;

		return c.json(sensor);
	},
);

// Update device sensor by id.
// Note: Nemo Cloud sensors are not allowed to update
// because sensor info is fetched from the cloud server
devicesApi.put(
	"/:deviceId/sensors/:sensorId",
	validateDeviceId({ from: "param" }),
	validateSensorId({ from: "param", required: true }),
	zValidator("json", UpdateSensorSchema),
	async (c) => {
		const sensor = c.var.sensor as Sensor;
		const { device } = c.var;
		const body = c.req.valid("json");

		if (device.type === "nemo_cloud") {
			throw new HTTPException(400, {
				message: "Nemo Cloud sensors are not allowed to update.",
			});
		}

		await db.upsertSensor({
			...sensor,
			...body,
		});

		return c.text("Sensor updated.");
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
