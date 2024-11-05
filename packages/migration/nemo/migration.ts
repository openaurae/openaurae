import { db } from "@openaurae/db";
import {
	chunks,
	dateFromSecs,
	dateToSecs,
	extractDate,
	isNil,
	log,
} from "@openaurae/lib";
import type { Device, MetricName, Reading } from "@openaurae/types";

import type { MigrationOptions } from "../config";
import { NemoCloudClient, type NemoCloudSession } from "./api";
import {
	type NemoCloudConfig,
	type NemoMeasure,
	type NemoMeasureSet,
	type NemoMeasureValue,
	NemoMetricNameSchema,
	metricNameMapping,
} from "./types";

export async function migrate(
	config: NemoCloudConfig,
	options: MigrationOptions = {},
): Promise<void> {
	// start and end are optional for measure sets API
	const { start, end, taskNum = 20 } = options;
	const client = new NemoCloudClient(config);
	const session = client.newSession();

	const devices = await session.devices();
	const deviceMigrations = devices.map(
		(device) => new NemoDeviceMigration(client, device.serial),
	);

	const migrateDevices = async (migrations: NemoDeviceMigration[]) => {
		for (const migration of migrations) {
			await migration.migrate(start, end);
		}
	};

	const migrationsPerTask = Math.ceil(deviceMigrations.length / taskNum);
	const tasks = chunks(deviceMigrations, migrationsPerTask).map(migrateDevices);
	await Promise.all(tasks);
}

class NemoDeviceMigration {
	private readonly session: NemoCloudSession;
	private readonly deviceSerial: string;

	public constructor(client: NemoCloudClient, deviceSerial: string) {
		this.session = client.newSession();
		this.deviceSerial = deviceSerial;
	}

	public async migrate(start?: Date, end?: Date): Promise<void> {
		const device = await this.session.device(this.deviceSerial);
		const room = await this.session.room(device.roomBid);

		await db.upsertDevice({
			id: device.serial,
			name: device.name,
			type: "nemo_cloud",
			user_id: null,
			...parseBuildingAndRoom(room.name),
		});

		const measureSetsList = await this.session.measureSets({
			deviceSerialNumber: device.serial,
			start: dateToSecs(start) ?? undefined,
			end: dateToSecs(end) ?? undefined,
		});

		// Since device serial is specified, the result have at most one element
		// containing target device's measure sets.
		if (measureSetsList.length === 0) {
			return;
		}

		const { measureSets } = measureSetsList[0];

		for (const measureSet of measureSets) {
			await this.migrateMeasureSet(measureSet);
		}
	}

	private async migrateMeasureSet(measureSet: NemoMeasureSet): Promise<void> {
		const sensor = await this.session.measureSetSensor(measureSet.bid);

		await db.upsertSensor({
			device: this.deviceSerial,
			id: sensor.serial,
			name: sensor.refExposition,
			type: "nemo_cloud",
		});

		const measures = await this.session.measures(measureSet.bid);

		for (const measure of measures) {
			await this.migrateMeasure(sensor.serial, measure);
		}

		log({
			level: "info",
			label: "migration-nemo",
			message: `migrated measure set ${JSON.stringify({
				deviceId: this.deviceSerial,
				start: dateFromSecs(measureSet.start).toISOString(),
				end: dateFromSecs(measureSet.end).toISOString(),
				valuesNumber: measureSet.valuesNumber,
			})}`,
		});
	}

	private async migrateMeasure(
		sensorSerial: string,
		measure: NemoMeasure,
	): Promise<void> {
		if (!measure.variable) {
			return;
		}

		const nemoMetricName = NemoMetricNameSchema.parse(measure.variable.name);
		const metricName = metricNameMapping[nemoMetricName];

		const values = await this.session.measureValues(measure.measureBid);

		for (const value of values) {
			await this.migrateMeasureValue(sensorSerial, metricName, value);
		}
	}

	private async migrateMeasureValue(
		sensorSerial: string,
		metricName: MetricName,
		{ time: seconds, value }: NemoMeasureValue,
	): Promise<void> {
		if (isNil(value)) {
			return;
		}

		const time = dateFromSecs(seconds);

		// upsert the metric column by PK
		const reading: Reading = {
			device: this.deviceSerial,
			sensor_id: sensorSerial,
			date: extractDate(time),
			time,
			reading_type: "nemo_cloud",
			processed: true,
			[metricName]: value,
		};

		await db.upsertSensorReading(reading);
	}
}

/**
 * Room names are manually recorded in format `<building>_<room><_Env>?`
 * such as `69_G.56_Corridor_Env` or `Staging Lab_Corner B`.
 * The default room name is `Pièce par défaut` if it is not manually updated.
 */
export function parseBuildingAndRoom(
	name: string | null,
): Pick<Device, "room" | "building"> {
	const result = name?.match(/^([^_]+?)_(.+?)(_Env)?$/);
	const [_, building, room] = result ?? [null, null, null];

	return {
		building,
		room: room?.replaceAll("_", " ") ?? null,
	};
}
