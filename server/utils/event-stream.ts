export type EventStream = ReturnType<typeof createEventStream>;

const streamsBySensorId = new Map<string, EventStream[]>();

export function subscribe(sensorId: string, stream: EventStream) {
  if (!streamsBySensorId.has(sensorId)) {
    streamsBySensorId.set(sensorId, []);
  }

  streamsBySensorId.get(sensorId)?.push(stream);
}

export function unsubscribe(sensorId: string, stream: EventStream) {
  if (!streamsBySensorId.has(sensorId)) {
    return;
  }

  const streams =
    streamsBySensorId.get(sensorId)?.filter((s) => s !== stream) || [];
  streamsBySensorId.set(sensorId, streams);
}
