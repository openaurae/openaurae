import { parse } from "mathjs";
import mqtt from "mqtt";

import { db } from "@openaurae/db";
import { log } from "@openaurae/lib";
import type { Reading, Sensor } from "@openaurae/types";
import { parseMessage } from "./message";

export type MqttClientOptions = mqtt.IClientOptions;

export type SubscribeOptions = { zigbee?: boolean; airQuality?: boolean };

export class MqttClient {
	private readonly client: mqtt.MqttClient;

	private constructor(client: mqtt.MqttClient) {
		this.client = client;

		client.on("message", (topic: string, messageBuffer: Buffer) =>
			this.onMessage(topic, messageBuffer),
		);
	}

	public static async fromEnv(): Promise<MqttClient> {
		const client = await mqtt.connectAsync({
			protocol: Bun.env.MQTT_PROTOCOL,
			host: Bun.env.MQTT_HOST,
			port: Number(Bun.env.MQTT_PORT),
			username: Bun.env.MQTT_USERNAME,
			password: Bun.env.MQTT_PASSWORD,
		});
		return new MqttClient(client);
	}

	public subscribe({ zigbee, airQuality }: SubscribeOptions = {}): void {
		if (zigbee) {
			this.client.subscribe("zigbee/#");
		}

		if (airQuality) {
			this.client.subscribe("air-quality/#");
		}
	}

	public async deleteZigbeeSensor(sensor: Sensor): Promise<void> {
		if (!sensor.type.startsWith("zigbee")) {
			throw Error(`Cannot delete non-zigbee sensor: ${sensor.type}`);
		}

		const topic = `zigbee/${sensor.device}/bridge/config/remove`;
		await this.client.publishAsync(topic, JSON.stringify(topic));
	}

	private async onMessage(topic: string, messageBuffer: Buffer): Promise<void> {
		if (isUnrelatedTopic(topic)) {
			return;
		}

		const message = JSON.parse(messageBuffer.toString());
		log({
			level: "info",
			label: "mqtt",
			message: `${topic} - new message ${JSON.stringify(message)}`,
		});

		const reading = parseMessage(topic, message);
		await db.upsertSensorReading(reading);

		const processed = await this.applyCorrections(reading);
		await db.upsertSensorReading(processed);
	}

	private async applyCorrections(reading: Reading): Promise<Reading> {
		const corrections = await db.getSensorCorrections(
			reading.device,
			reading.reading_type,
		);

		const result: Reading = { ...reading, processed: true };

		for (const { metric, expression } of corrections) {
			result[metric] = parse(expression).evaluate(reading);
		}

		return result;
	}
}

/**
 * Zigbee config, log and state messages should be ignored.
 */
function isUnrelatedTopic(topic: string): boolean {
	return topic.match(/^zigbee\/.*?\/bridge\/.*$/) !== null;
}
