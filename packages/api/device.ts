import { zValidator } from "@hono/zod-validator";
import { Hono } from "hono";
import { z } from "zod";

import { db } from "@openaurae/db";
import { DeviceTypeSchema } from "@openaurae/types";
import type { AuthVariables } from "./middleware";

const devicesApi = new Hono<{ Variables: AuthVariables }>();

// Get user devices. Return all devices if user can access all resources.
devicesApi.get(
	"/",
	zValidator(
		"query",
		z.object({
			type: DeviceTypeSchema.optional().describe("filter by device type"),
			building: z.string().optional().describe("filter by building"),
		}),
	),
	async (c) => {
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

		return c.json(devices);
	},
);

export { devicesApi };
