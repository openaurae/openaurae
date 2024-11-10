import { clerkMiddleware } from "@hono/clerk-auth";
import { Hono } from "hono";
import { cors } from "hono/cors";
import { csrf } from "hono/csrf";
import { showRoutes } from "hono/dev";
import { HTTPException } from "hono/http-exception";
import { logger } from "hono/logger";
import { ZodError } from "zod";

import { buildingApi } from "./building";
import { devicesApi } from "./device";
import { exportApi } from "./export.ts";
import { userInfo } from "./middleware";

const api = new Hono();

// Note: cors must be the first one to handle requests
api.use(cors(), csrf());

if (Bun.env.NODE_ENV === "development") {
	api.use(logger());
}

api.onError((err, c) => {
	if (err instanceof HTTPException) {
		return err.getResponse();
	}

	if (err instanceof ZodError) {
		return c.text(err.message, 400);
	}

	return c.text(err.message, 500);
});

api.get("/health", (c) => {
	return c.json({
		status: "up",
	});
});

api.use("/api/*", clerkMiddleware(), userInfo);
api
	.basePath("/api/v1")
	.route("/devices", devicesApi)
	.route("/buildings", buildingApi);

api.route("/", exportApi);

if (Bun.env.NODE_ENV === "development") {
	showRoutes(api, { verbose: true });
}

export { api };
