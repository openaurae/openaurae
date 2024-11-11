import { MqttClient } from "./client";

declare module "bun" {
	/**
	 * Declaration of related environment variables.
	 *
	 * @see [Bun environment variables](https://bun.sh/docs/runtime/env)
	 * @see [Interface merging](https://www.typescriptlang.org/docs/handbook/declaration-merging.html#merging-interfaces)
	 */
	interface Env {
		MQTT_URL: string;
		MQTT_USERNAME?: string;
		MQTT_PASSWORD?: string;
	}
}

export * from "./client";

export const mqttClient = await MqttClient.fromEnv();
