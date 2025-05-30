import { $UpdateDevice } from "#shared/types";
import { updateDeviceById, validateDeviceId } from "~/server/utils";

export default defineEventHandler(async (event): Promise<void> => {
  const device = await validateDeviceId(event);
  const model = await validateRequest(event, "body", $UpdateDevice);

  await updateDeviceById({
    ...device,
    ...model,
  });

  setResponseStatus(event, 201, "Device updated successfully");
});
