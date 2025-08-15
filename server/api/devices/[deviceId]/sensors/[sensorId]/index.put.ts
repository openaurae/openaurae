import { $UpdateSensor } from "#shared/schema";
import { updateSensorById } from "~~/server/utils";

export default defineEventHandler(async (event) => {
  const model = await validateRequest(event, "body", $UpdateSensor);
  const sensor = await validateSensorId(event);

  await updateSensorById({
    ...sensor,
    ...model,
  });

  setResponseStatus(event, 201, "Sensor updated successfully");
});
