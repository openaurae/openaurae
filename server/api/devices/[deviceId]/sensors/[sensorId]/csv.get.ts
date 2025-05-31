import { stringify } from "csv-stringify";
import { format, startOfDay, subDays } from "date-fns";
import { sendStream } from "h3";
import { Readable } from "node:stream";
import { z } from "zod/v4";
import { MetricsMetadata } from "~/shared/metadata";

const $Query = z.object({
  keyId: z.string(),
  start: z.coerce
    .date()
    .optional()
    .default(() => subDays(new Date(), 1)),
  end: z.coerce
    .date()
    .optional()
    .default(() => new Date()),
});

export default defineEventHandler(async (event) => {
  const { keyId, start, end } = await validateRequest(event, "query", $Query);
  const key = await verifyKeyId(keyId);

  if (!key) {
    throw createError({
      statusCode: 403,
      statusMessage: "Invalid key",
    });
  }

  const sensor = await validateSensorId(event, key.user_id);
  const readings = await getSensorReadings(sensor, start, end);

  const stringifier = stringify({
    header: true,
    columns: [
      { key: "device_id", header: "device_id" },
      { key: "sensor_id", header: "sensor_id" },
      { key: "time", header: "time" },
      ...MetricsMetadata[sensor.type].map(({ name }) => ({
        key: name,
        header: name,
      })),
    ],
    encoding: "utf8",
  });

  const filename = `${sensor.device_id}-${sensor.id}-${formatDate(start)}-${formatDate(end)}.csv`;

  const resp = event.node.res;
  resp.setHeader("Content-Type", "text/csv");
  resp.setHeader("Content-Disposition", `attachment; filename="${filename}"`);

  return sendStream(event, Readable.from(readings).pipe(stringifier));
});

function formatDate(date: Date): string {
  return format(startOfDay(date), "yyyyMMdd");
}
