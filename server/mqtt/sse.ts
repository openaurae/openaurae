import type { Reading } from "#shared/types";

type EventStream = ReturnType<typeof createEventStream>;

const deviceStreams = new Map<string, EventStream[]>();

export function subscribe(deviceId: string, stream: EventStream) {
  const streams = deviceStreams.get(deviceId) ?? [];

  deviceStreams.set(deviceId, [...streams, stream]);
}

export function unsubscribe(deviceId: string, stream: EventStream) {
  const streams = deviceStreams.get(deviceId) ?? [];

  deviceStreams.set(
    deviceId,
    streams.filter((s) => s !== stream),
  );
}

export function publish(deviceId: string, reading: Reading) {
  const streams = deviceStreams.get(deviceId) ?? [];

  for (const stream of streams) {
    stream.push(JSON.stringify(reading));
  }
}
