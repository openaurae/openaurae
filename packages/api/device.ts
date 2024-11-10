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
import {
	GetDevicesSchema,
	type Reading,
	UpdateDeviceSchema,
} from "@openaurae/types";
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

export { devicesApi };
