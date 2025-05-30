import { db } from "~/server/database";
import { deleteSensor, deleteSensorReadings } from "~/server/utils";

export default defineEventHandler(async (event) => {
  const sensor = await validateSensorId(event);

  await db.transaction().execute(async (tx) => {
    await deleteSensor(sensor, tx);
    await deleteSensorReadings(sensor, tx);
  });

  return {
    message: "Sensor and readings deleted successfully.",
  };
});
