import { Hono } from "hono";

import { db } from "@openaurae/db";
import { isNotNil } from "@openaurae/lib";
import type { AuthVariables } from "./middleware";

const buildingApi = new Hono<{ Variables: AuthVariables }>();

buildingApi.get("/", async (c) => {
	const { permissions, userId } = c.var;

	const devices = permissions.readAll
		? await db.getDevices()
		: await db.getDevicesByUserId(userId);

	const buildings = devices
		.filter((device) => device.type === "nemo_cloud")
		.map((device) => device.building)
		.filter(isNotNil);

	const uniqueBuildings = [...new Set(buildings)];

	return c.json(uniqueBuildings);
});

export { buildingApi };
