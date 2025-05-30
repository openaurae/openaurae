import { deleteSensor, deleteSensorReadings } from "~/server/utils";

export default defineEventHandler(async (event) => {
  const sensor = await validateSensorId(event);

  await deleteSensor(sensor);
  await deleteSensorReadings(sensor);

  return {
    message: "Sensor and readings deleted successfully.",
  };
});
