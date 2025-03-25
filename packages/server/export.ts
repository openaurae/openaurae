import { Readable } from "node:stream";
import { clerkMiddleware } from "@hono/clerk-auth";
import { zValidator } from "@hono/zod-validator";
import { stringify } from "csv";
import { Hono } from "hono";
import { HTTPException } from "hono/http-exception";
import { stream } from "hono/streaming";
import { z } from "zod";

import { db } from "@openaurae/db";
import { formatDate } from "@openaurae/lib";
import type { Reading } from "@openaurae/types";
import { eachDayOfInterval, format } from "date-fns";
import { userInfo, validateDeviceId } from "./middleware";

const exportApi = new Hono();

export const preSignedReadings = new Map<
	string,
	{ deviceId: string; start: Date; end: Date }
>();

exportApi.get(
	"/pre-sign/readings",
	clerkMiddleware(),
	userInfo,
	validateDeviceId({ from: "query" }),
	zValidator(
		"query",
		z.object({
			deviceId: z.string().min(1),
			start: z.coerce.date(),
			end: z.coerce.date(),
		}),
	),
	async (c) => {
		const { device } = c.var;
		const { start, end } = c.req.valid("query");

		const key = crypto.randomUUID();

		preSignedReadings.set(key, { deviceId: device.id, start, end });

		setTimeout(() => preSignedReadings.delete(key), 2 * 3600 * 1000);

		return c.json({
			key,
		});
	},
);

exportApi.get("/export/readings/:key", async (c) => {
	const key = c.req.param("key");
	const resource = preSignedReadings.get(key);

	if (!resource) {
		throw new HTTPException(404, { message: "Pre-signed resource not found." });
	}

	const { deviceId, start, end } = resource;

	const formatDate = (date: Date): string => format(date, "yyyyMMdd");
	const filename = `${deviceId}-${formatDate(start)}-${formatDate(end)}.csv`;

	return stream(c, async (stream) => {
		c.header("Content-Type", "text/csv");
		c.header("Content-Disposition", `attachment; filename="${filename}"`);

		const csvStringifier = stringify({
			header: true,
			delimiter: ",",
		});

		Readable.from(deviceReadings(deviceId, start, end)).pipe(csvStringifier);

		for await (const row of csvStringifier) {
			await stream.write(row);
		}
	});
});

async function* deviceReadings(
	deviceId: string,
	start: Date,
	end: Date,
): AsyncGenerator<
	Omit<Reading, "time" | "date"> & { date: string; time: string }
> {
	for (const date of eachDayOfInterval({ start, end })) {
		const readings = await db.getDeviceReadingsOnDate(deviceId, date);
		for (const reading of readings) {
			yield {
				...reading,
				date: formatDate(reading.date),
				time: reading.time.toISOString(),
			};
		}
	}
}

export { exportApi };
