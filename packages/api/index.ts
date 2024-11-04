import { clerkMiddleware } from "@hono/clerk-auth";
import { Hono } from "hono";
import { cors } from "hono/cors";
import { csrf } from "hono/csrf";
import { showRoutes } from "hono/dev";
import { HTTPException } from "hono/http-exception";
import { ZodError } from "zod";

import { setUerInfo } from "./auth";

const api = new Hono();

api.use(csrf(), cors());

api.use("/api/*", clerkMiddleware(), setUerInfo);

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

if (Bun.env.NODE_ENV === "development") {
	showRoutes(api, { verbose: true });
}

export { api };
