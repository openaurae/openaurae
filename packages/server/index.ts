import { clerkMiddleware } from "@hono/clerk-auth";
import { Hono } from "hono";
import { cors } from "hono/cors";
import { showRoutes } from "hono/dev";
import { HTTPException } from "hono/http-exception";
import { logger } from "hono/logger";
import { serveStatic } from 'hono/bun'
import { ZodError } from "zod";

import { buildingApi } from "./building";
import { devicesApi } from "./device";
import { exportApi } from "./export";
import { internalApi } from "./internal";
import { userInfo } from "./middleware";
import {mqttClient} from "@openaurae/mqtt";

const app = new Hono();

// Note: cors must be the first one to handle requests
app.use(cors());

if (Bun.env.NODE_ENV === "development") {
	app.use(logger());
}

app.onError((err, c) => {
	if (err instanceof HTTPException) {
		return err.getResponse();
	}

	if (err instanceof ZodError) {
		return c.text(err.message, 400);
	}

	return c.text(err.message, 500);
});

app.get("/health", (c) => {
	return c.json({
		status: "up",
	});
});

app.use("/api/*", clerkMiddleware(), userInfo);
app
	.basePath("/api/v1")
	.route("/devices", devicesApi)
	.route("/buildings", buildingApi);

app.route("/", exportApi);
app.route("/api", internalApi);

app.use('*', serveStatic({ root: './static' }))
app.get('*', serveStatic({ path: './static/index.html' }))

if (Bun.env.NODE_ENV === "development") {
	showRoutes(app, { verbose: true });
}

mqttClient.subscribe({zigbee: true, airQuality: true});

export default app;
