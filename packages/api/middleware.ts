import { getAuth } from "@hono/clerk-auth";
import { createMiddleware } from "hono/factory";
import { HTTPException } from "hono/http-exception";

import { db } from "@openaurae/db";
import { type Device, Role, type Sensor } from "@openaurae/types";

export type AuthVariables = {
	userId: string;
	permissions: {
		readAll: boolean;
		updateAll: boolean;
	};
};

// Unfortunately, permissions are paid features in production environment,
// so default roles are used.
export const userInfo = createMiddleware<{ Variables: AuthVariables }>(
	async (c, next) => {
		const auth = getAuth(c);

		if (!auth || !auth.userId) {
			throw new HTTPException(401, { message: "Login required." });
		}

		c.set("userId", auth.userId);
		c.set("permissions", {
			// readAll: auth.has({ permission: Permission.ReadAll }),
			// updateAll: auth.has({ permission: Permission.UpdateAll }),
			readAll: auth.has({ role: Role.Admin }),
			updateAll: auth.has({ role: Role.Admin }),
		});

		await next();
	},
);

export type DeviceVariables = AuthVariables & {
	device: Device;
};

// Validate device id from path variable "deviceId" by rules below:
// 1. The device must exist
// 2. Either user owns the device or user can access all resources
export const validateDeviceId = createMiddleware<{
	Variables: DeviceVariables;
}>(async (c, next) => {
	const deviceId = c.req.param("deviceId");
	const { userId, permissions } = c.var;

	if (deviceId === undefined) {
		throw new HTTPException(400, { message: "Device id required." });
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

export type SensorVariables<Required extends boolean> = DeviceVariables & {
	sensor: Required extends true ? Sensor : null;
};

export type ValidateSensorIdOptions = {
	from: "query" | "param";
	required: boolean;
};

// Validate sensor id from either path variable or query params.
// Note: this middleware must be used after `validateDeviceId`
// so that device is validated first.
export const validateSensorId = ({ from, required }: ValidateSensorIdOptions) =>
	createMiddleware<{
		Variables: SensorVariables<typeof required>;
	}>(async (c, next) => {
		const sensorId =
			from === "param" ? c.req.param("sensorId") : c.req.query("sensorId");

		if (!sensorId) {
			if (required) {
				throw new HTTPException(400, { message: "Sensor id required." });
			}

			c.set("sensor", null);
			await next();

			return;
		}

		const device = c.var.device;
		const sensor = await db.getSensorById(device.id, sensorId);

		if (!sensor) {
			throw new HTTPException(404, { message: "Sensor not found." });
		}

		c.set("sensor", sensor);
		await next();
	});
