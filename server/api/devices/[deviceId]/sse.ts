import { z } from "zod/v4";
import { subscribe, unsubscribe } from "~/server/mqtt/sse";
import { $DeviceId } from "~/shared/types";

const $Params = z.object({
  deviceId: $DeviceId,
});

export default defineEventHandler(async (event) => {
  const { deviceId } = await validateRequest(event, "params", $Params);
  const { res } = event.node;
  res.setHeader("Content-Type", "text/event-stream");
  res.setHeader("Cache-Control", "no-cache");
  res.setHeader("Connection", "keep-alive");

  const eventStream = createEventStream(event);

  subscribe(deviceId, eventStream);

  eventStream.onClosed(async () => {
    unsubscribe(deviceId, eventStream);
    await eventStream.close();
  });

  return eventStream.send();
});
