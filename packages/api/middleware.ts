import { getAuth } from "@hono/clerk-auth";
import { createMiddleware } from "hono/factory";
import { HTTPException } from "hono/http-exception";

import { db } from "@openaurae/db";
import { type Device, Permission } from "@openaurae/types";

export type AuthVariables = {
	userId: string;
	permissions: {
		readAll: boolean;
		updateAll: boolean;
	};
};

export const userInfo = createMiddleware<{ Variables: AuthVariables }>(
	async (c, next) => {
		const auth = getAuth(c);

		if (!auth || !auth.userId) {
			throw new HTTPException(401, { message: "Login required." });
		}

		c.set("userId", auth.userId);
		c.set("permissions", {
			readAll: auth.has({ permission: Permission.ReadAll }),
			updateAll: auth.has({ permission: Permission.UpdateAll }),
		});

		await next();
	},
);

export type DeviceVariables = AuthVariables & {
	device: Device;
};

export const validateDeviceId = createMiddleware<{
	Variables: DeviceVariables;
}>(async (c, next) => {
	const deviceId = c.req.param("deviceId");
	const { userId, permissions } = c.var;

	if (deviceId === undefined) {
		throw new HTTPException(400, {
			message: "Device id required.",
		});
	}

	const device = await db.getDeviceById(deviceId);

	if (!device) {
		throw new HTTPException(404, { message: "Device not found." });
	}

	if (device.user_id !== userId && !permissions.readAll) {
		throw new HTTPException(401, {
			message: "Only admin or device owner can access this device.",
		});
	}

	c.set("device", device);

	await next();
});
