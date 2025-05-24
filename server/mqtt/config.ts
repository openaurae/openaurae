import { z } from "zod/v4";

const runtimeConfig = useRuntimeConfig();

export const $MqttConfig = z.object({
  protocol: z.enum(["mqtt", "mqtts", "ws", "wss"]),
  host: z.string(),
  port: z.coerce.number().positive(),
});

export const mqttConfig = $MqttConfig.parse(runtimeConfig.mqtt);
