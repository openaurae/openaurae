import { $Readings, type Reading, SensorTypes } from "#shared/types";

import type { Message } from "./types";

export function parseAirQualityMessage(message: Message): Reading {
  if (message.sensor === SensorTypes.AQ_PMS) {
    return parsePmsMessage(message);
  }

  if (message.sensor === SensorTypes.AQ_PTQS) {
    return parsePtqsMessage(message);
  }

  throw Error(`[air-quality] Unsupported sensor type: ${message.sensor}`);
}

export function parsePmsMessage({
  sensor: sensor_id,
  PMVtotal: pmv_total,
  ...message
}: Message): Reading {
  return $Readings.pms5003st.parse({
    ...lowercasedKeys(message),
    sensor_id,
    pmv_total,
  });
}

export function parsePtqsMessage({
  sensor: sensor_id,
  ...message
}: Message): Reading {
  return $Readings.ptqs1005.parse({
    ...lowercasedKeys(message),
    sensor_id,
  });
}

function lowercasedKeys(message: Message): Message {
  const entries = Object.entries(message).map(([name, value]) => [
    name.toLowerCase(),
    value,
  ]);
  return Object.fromEntries(entries);
}
