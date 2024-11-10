import { zValidator } from "@hono/zod-validator";
import { startOfDay } from "date-fns";
import { Hono } from "hono";
import { z } from "zod";

import { db } from "@openaurae/db";
import { sortDevicesByTimeDesc, sortSensorsByTimeDesc } from "@openaurae/lib";
import { GetDevicesSchema } from "@openaurae/types";
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
devicesApi.get("/:deviceId", validateDeviceId, async (c) => {
	const device = c.var.device;
	const sensors = await db.getSensorsByDeviceId(device.id);

	return c.json({
		...device,
		sensors: sortSensorsByTimeDesc(sensors),
	});
});

// Get device or sensor readings within a time range.
devicesApi.get(
	"/:deviceId/readings",
	validateDeviceId,
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

		return c.json(readings);
	},
);

export { devicesApi };
