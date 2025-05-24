import { $Readings, type Reading } from "#shared/types";

import type { Message } from "./types";

export function parseZigbeeMessage(topic: string, message: Message): Reading {
  const { device_id, sensor_id } = parseZigbeeTopic(topic);

  if (!device_id || !sensor_id) {
    throw Error(`[zigbee] device id or sensor id is missing in topic ${topic}`);
  }

  const reading = { ...message, device_id, sensor_id };

  if ("power" in reading) {
    return $Readings.zigbee_power.parse(reading);
  }
  if ("temperature" in reading) {
    return $Readings.zigbee_temp.parse(reading);
  }
  if ("contact" in message) {
    return $Readings.zigbee_contact.parse(reading);
  }
  if ("occupancy" in message) {
    $Readings.zigbee_occupancy.parse(reading);
  }
  if ("angle_x" in message) {
    return $Readings.zigbee_vibration.parse(reading);
  }

  throw Error(`[zigbee] Unsupported reading type ${JSON.stringify(reading)}`);
}

/**
 * Parse Zigbee device id and sensor id which are included only in the message topic.
 *
 * Sensor readings are published to `{baseTopic}/{friendlyName}`
 * where `baseTopic` is configured as `zigbee/{deviceId}` and `friendlyName` as `{sensorId}`.
 * Below is an example of [configuration](https://www.zigbee2mqtt.io/guide/configuration/):
 *
 * ```yaml
 *  mqtt:
 *    base_topic: 'zigbee/bB:27:eb:2a:9f:d4'
 *    server: mqtt://mqtt.openaurae.org:1883
 *  devices:
 *    '0x00158100044b47a2':
 *      friendly_name: '0x00158400044b47a2'
 * ```
 *
 * In this example, sensor readings are published to topic `zigbee/bB:27:eb:2a:9f:d4/0x00158400044b47a2`.
 * Any topics that are in other formats should be detected and filtered:
 *
 * 1. zigbee/{deviceId}/{sensorId}/#
 * 2. zigbee/{deviceId}/bridge/#
 *
 * @see [Zigbee2MQTT Topics](https://www.zigbee2mqtt.io/guide/usage/mqtt_topics_and_messages.html)
 */
export function parseZigbeeTopic(topic: string): {
  device_id?: string;
  sensor_id?: string;
} {
  const paths = topic.split("/").filter((path) => path !== "");

  if (paths.length < 3 || paths[2] === "bridge") {
    return {};
  }

  const [_, device_id, sensor_id] = paths;

  return {
    device_id,
    sensor_id,
  };
}
