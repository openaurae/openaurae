import mqtt from "mqtt";
import z, { ZodError } from "zod";
import { $Reading, db } from "~/server/database";

const runtimeConfig = useRuntimeConfig();

const $Config = z.object({
  protocol: z.enum(["mqtt", "mqtts", "ws", "wss"]),
  host: z.string(),
  port: z.coerce.number().positive(),
});

const $Message = z.record(
  z.string(),
  z.union([z.string(), z.number(), z.boolean(), z.null()]),
);

type Message = z.infer<typeof $Message>;

export default defineNitroPlugin((nitroApp) => {
  const config = $Config.parse(runtimeConfig.mqtt);
  const client = mqtt.connect(config);

  client.on("connect", () => {
    console.log(`[mqtt] Connected to ${JSON.stringify(runtimeConfig.mqtt)}`);

    client.subscribe("air-quality/#", (err) => {
      if (err) {
        console.log(`[mqtt] [air-quality/#] Subscription failed: ${err}`);
      } else {
        console.log("[mqtt] [air-quality/#] Subscription success");
      }
    });

    client.subscribe("zigbee/#", (err) => {
      if (err) {
        console.log(`[mqtt] [zigbee/#] Subscription failed: ${err}`);
      } else {
        console.log("[mqtt] [zigbee/#] Subscription success");
      }
    });

    client.on("message", async (topic: string, messageBuffer: Buffer) => {
      try {
        const message = $Message.parse(JSON.parse(messageBuffer.toString()));
        console.log(`[mqtt] [${topic}] Received: ${messageBuffer}`);

        if (topic.startsWith("air-quality") && "sensor" in message) {
          if (message.sensor === "pms5003st") {
            await persistPmsMessage(message);
          } else if (message.sensor === "ptqs1005") {
            await persistPtqsMessage(message);
          }
        } else if (topic.startsWith("zigbee")) {
          const { device_id, sensor_id } = parseZigbeeTopic(topic);
          if (!device_id || !sensor_id) {
            // invalid topic format or unrelated topics
            return;
          }
          // TODO: handle Zigbee messages
        }
      } catch (e: unknown) {
        // skip handling message if
        // 1. message is not in JSON format
        // 2. type of message is not Record<string, string | number | boolean | null>
        // 3. related device/sensor doesn't exist (FK violation)
        // TODO: detailed error message like raw message, deviceId and sensorId
        if (e instanceof ZodError) {
          console.log(`[mqtt] [${topic}] invalid message format`);
        } else if (
          e instanceof Error &&
          e.message.includes("foreign key constraint")
        ) {
          console.log(`[mqtt] [${topic}] related device/sensor doesn't exist`);
        }
      }
    });
  });

  nitroApp.hooks.hook("close", () => client.end());
});

async function persistPmsMessage({
  sensor: sensor_id,
  PMVtotal: pmv_total,
  ...message
}: Message): Promise<void> {
  const reading = $Reading.pms5003st.parse({
    ...lowercasedKeys(message),
    sensor_id,
    pmv_total,
  });

  await db.insertInto("readings_pms5003st").values(reading).execute();
}

async function persistPtqsMessage({
  sensor: sensor_id,
  ...message
}: Message): Promise<void> {
  const reading = $Reading.ptqs1005.parse({
    ...lowercasedKeys(message),
    sensor_id,
  });

  await db.insertInto("readings_ptqs1005").values(reading).execute();
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
function parseZigbeeTopic(topic: string): {
  device_id?: string;
  sensor_id?: string;
} {
  const matched = topic.match(/^zigbee\/([^/]+)\/([^/]+)$/);

  const [_, device_id, sensor_id] = matched ?? [];

  return device_id === "bridge"
    ? {}
    : {
        device_id,
        sensor_id,
      };
}

function lowercasedKeys<T extends Message>(
  payload: T,
): {
  [K in keyof T as K extends string ? Lowercase<K> : K]: T[K];
} {
  const entries = Object.entries(payload).map(([name, value]) => [
    name.toLowerCase(),
    value,
  ]);
  return Object.fromEntries(entries);
}
