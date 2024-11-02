import { parse } from "mathjs";
import mqtt from "mqtt";

import { Database } from "@openaurae/db";
import type { Reading } from "@openaurae/types";
import { parseMessage } from "./message";

export type MqttClientOptions = mqtt.IClientOptions;

export type SubscribeOptions = { zigbee?: boolean; airQuality?: boolean };

export class MqttClient {
	private readonly client: mqtt.MqttClient;
	private readonly db: Database;

	private constructor(client: mqtt.MqttClient, db: Database) {
		this.client = client;
		this.db = db;

		client.on("message", (topic: string, messageBuffer: Buffer) =>
			this.onMessage(topic, messageBuffer),
		);
	}

	public static async build(
		options: MqttClientOptions,
		db: Database,
	): Promise<MqttClient> {
		const client = await mqtt.connectAsync(options);
		return new MqttClient(client, db);
	}

	public static async fromEnv(): Promise<MqttClient> {
		const client = await mqtt.connectAsync({
			protocol: Bun.env.MQTT_PROTOCOL,
			host: Bun.env.MQTT_HOST,
			port: Number(Bun.env.MQTT_PORT),
			username: Bun.env.MQTT_USERNAME,
			password: Bun.env.MQTT_PASSWORD,
		});
		const db = Database.fromEnv();
		return new MqttClient(client, db);
	}

	public subscribe({ zigbee, airQuality }: SubscribeOptions = {}): void {
		if (zigbee) {
			this.client.subscribe("zigbee/#");
		}

		if (airQuality) {
			this.client.subscribe("air-quality/#");
		}
	}

	private async onMessage(topic: string, messageBuffer: Buffer): Promise<void> {
		if (isUnrelatedTopic(topic)) {
			return;
		}

		const message = JSON.parse(messageBuffer.toString());
		console.log(
			`[mqtt] new message from topic ${topic} ${JSON.stringify(message)}]`,
		);

		const reading = parseMessage(topic, message);
		await this.db.upsertSensorReading(reading);

		const processed = await this.applyCorrections(reading);
		await this.db.upsertSensorReading(processed);
	}

	private async applyCorrections(reading: Reading): Promise<Reading> {
		const corrections = await this.db.getSensorCorrections(
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
