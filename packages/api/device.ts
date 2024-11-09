import { zValidator } from "@hono/zod-validator";
import { Hono } from "hono";

import { db } from "@openaurae/db";
import { GetDevicesSchema } from "@openaurae/types";
import { type AuthVariables, validateDeviceId } from "./middleware";

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

	return c.json(devices);
});

// Get user device by id.
devicesApi.get("/:deviceId", validateDeviceId, async (c) => {
	const device = c.var.device;
	const sensors = await db.getSensorsByDeviceId(device.id);

	return c.json({
		...device,
		sensors,
	});
});

export { devicesApi };
