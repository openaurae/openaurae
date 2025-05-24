import type { Reading, Sensor } from "#shared/types";
import mqtt from "mqtt";

import { parseAirQualityMessage } from "./air-qualiry";
import { mqttConfig } from "./config";
import { publish } from "./sse";
import { $Message, type Message } from "./types";
import { parseZigbeeMessage } from "./zigbee";

export * from "./config";

const Topics = {
  AIR_QUALITY: "air-quality",
  ZIGBEE: "zigbee",
} as const;

export const mqttClient = mqtt.connect(mqttConfig);

mqttClient.on("connect", async () => {
  console.log(`[mqtt] Connected to ${JSON.stringify(mqttConfig)}`);

  await mqttClient.subscribeAsync(["air-quality/#", "zigbee/#"]);

  console.log("[mqtt] Subscribed to air-quality/# and zigbee/#");

  mqttClient.on("message", onMessage);
});

export async function onMessage(topic: string, messageBuffer: Buffer) {
  try {
    const message = $Message.parse(JSON.parse(messageBuffer.toString()));
    console.log(`[mqtt] [${topic}] [new message] ${messageBuffer}`);

    const reading = parseMessage(topic, message);

    const sensor = await getSensorById(reading.device_id, reading.sensor_id);

    if (!sensor) {
      throw new Error(
        `Sensor not found deviceId: ${reading.device_id} sensorId: ${reading.sensor_id}`,
      );
    }

    await upsertSensorReading(sensor.type, reading);
    publish(sensor.device_id, reading);
  } catch (error) {
    console.error(`[mqtt] ${error}`);
  }
}

export async function deleteZigbeeSensor(sensor: Sensor) {
  const topic = `zigbee/${sensor.device_id}/bridge/config/remove`;

  await mqttClient.publishAsync(topic, JSON.stringify(topic));
}

function parseMessage(topic: string, message: Message): Reading {
  if (topic.startsWith(Topics.AIR_QUALITY) && "sensor" in message) {
    return parseAirQualityMessage(message);
  }
  if (topic.startsWith(Topics.ZIGBEE)) {
    return parseZigbeeMessage(topic, message);
  }

  throw Error(`Unsupported topic: ${topic}`);
}
