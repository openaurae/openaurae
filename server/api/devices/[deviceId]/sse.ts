import { subscribe, unsubscribe } from "~~/server/mqtt/sse";
import { validateDeviceId } from "~~/server/utils";

export default defineEventHandler(async (event) => {
  const device = await validateDeviceId(event);
  const { res } = event.node;
  res.setHeader("Content-Type", "text/event-stream");
  res.setHeader("Cache-Control", "no-cache");
  res.setHeader("Connection", "keep-alive");

  const eventStream = createEventStream(event);

  subscribe(device.id, eventStream);

  eventStream.onClosed(async () => {
    unsubscribe(device.id, eventStream);
    await eventStream.close();
  });

  return eventStream.send();
});
