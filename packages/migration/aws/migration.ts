import { eachDayOfInterval } from "date-fns";

import { db } from "@openaurae/db";
import { formatDate, log } from "@openaurae/lib";
import {
	type Device,
	type DeviceType,
	deviceSensorTypes,
} from "@openaurae/types";
import { AwsOpenAurae, type GqlDevice } from "./api";

export class AwsOpenAuraeMigration {
	private readonly client: AwsOpenAurae;

	public constructor() {
		this.client = new AwsOpenAurae();
	}

	public async migrateDevices(): Promise<Device[]> {
		const gqlDevices = await this.client.getDevices();

		const result: Device[] = [];

		for (const gqlDevice of gqlDevices) {
			const device = await this.migrateDevice(gqlDevice);
			result.push(device);
		}

		return result;
	}

	private async migrateDevice(gqlDevice: GqlDevice): Promise<Device> {
		const { sensors, ...dev } = gqlDevice;
		const deviceType = inferDeviceType(gqlDevice);

		for (const sensor of sensors) {
			await db.upsertSensor(sensor);
		}

		if (sensors.length === 0 && deviceType === "air_quality") {
			// the AWS server doesn't persist sensors of AQ boxes
			for (const sensorType of deviceSensorTypes.air_quality) {
				await db.upsertSensor({
					device: dev.id,
					id: sensorType,
					name: sensorType,
					type: sensorType,
				});
			}
		}

		const device = { ...dev, type: deviceType, user_id: null };
		await db.upsertDevice(device);

		return device;
	}

	public async migrateDeviceReadings(
		device: Device,
		start: Date,
		end: Date,
	): Promise<void> {
		const lastRecord = device.last_record ?? new Date(0);

		const dates = eachDayOfInterval({ start, end }).filter(
			(date) => date <= lastRecord,
		);

		for (const date of dates) {
			for (const sensorType of deviceSensorTypes[device.type]) {
				for (const processed of [true, false]) {
					const readings = await this.client.getDeviceReadings({
						deviceId: device.id,
						type: sensorType,
						date,
						processed,
					});

					for (const reading of readings) {
						await db.upsertSensorReading(reading);
					}
				}
			}

			log({
				level: "info",
				label: "migration-aws",
				message: `migrated readings ${JSON.stringify({ deviceId: device.id, date: formatDate(date) })}`,
			});
		}
	}
}

/**
 * Guess device type based on last record time and sensors.
 *
 * - If device has readings and 0 sensor, it should be an AQ box
 * because AQ sensors are not persisted in previous version.
 * - If device has no readings or sensors, we assume it's a Zigbee device.
 * - If device has only Zigbee sensors, it should be a Zigbee device
 * - If device has AQ and Zigbee sensors, an error will be thrown because
 * we have to determine the device type by checking related readings.
 */
function inferDeviceType({ id, last_record, sensors }: GqlDevice): DeviceType {
	if (sensors.length === 0) {
		return last_record ? "air_quality" : "zigbee";
	}

	const allZigbee = sensors.every(({ type }) => type.startsWith("zigbee"));

	if (!allZigbee) {
		throw Error(
			`Cannot infer type of device ${id} because it has zigbee and air quality sensors`,
		);
	}

	return "zigbee";
}
