import * as cassandra from "cassandra-driver";
import { eachDayOfInterval } from "date-fns";

import { sortReadingsByTimeAsc } from "@openaurae/lib";
import type {
	Correction,
	Device,
	Reading,
	Sensor,
	SensorType,
} from "@openaurae/types";

type ModelMapper<T> = cassandra.mapping.ModelMapper<T>;
type _Reading = Reading & {
	date: cassandra.types.LocalDate;
};

export const q = cassandra.mapping.q;

export type GetReadingsOptions = {
	sensor: Sensor;
	processed: boolean;
	start: Date;
	end: Date;
};

export class Database {
	public readonly client: cassandra.Client;
	private readonly mapper: cassandra.mapping.Mapper;

	public readonly devices: ModelMapper<Device>;
	public readonly sensors: ModelMapper<Sensor>;
	public readonly corrections: ModelMapper<Correction>;
	public readonly readings: ModelMapper<_Reading>;

	constructor(host: string, keyspace: string) {
		this.client = new cassandra.Client({
			contactPoints: [host],
			localDataCenter: "datacenter1",
			keyspace,
		});

		this.mapper = new cassandra.mapping.Mapper(this.client, {
			models: {
				Device: { tables: ["device"] },
				Sensor: { tables: ["sensor"] },
				Reading: { tables: ["reading"] },
				Correction: { tables: ["correction"] },
			},
		});

		this.devices = this.mapper.forModel("Device");
		this.sensors = this.mapper.forModel("Sensor");
		this.corrections = this.mapper.forModel("Correction");
		this.readings = this.mapper.forModel("Reading");
	}

	public static fromEnv(): Database {
		return new Database(Bun.env.CASSANDRA_HOST, Bun.env.CASSANDRA_KEYSPACE);
	}

	public async connect(): Promise<void> {
		await this.client.connect();
	}

	public async shutdown(): Promise<void> {
		await this.client.shutdown();
	}

	public async upsertDevice(device: Device): Promise<void> {
		await this.devices.insert(device);
	}

	public async getDevices(): Promise<Device[]> {
		const result = await this.devices.findAll();

		return result.toArray();
	}

	public async getDeviceById(id: string): Promise<Device | null> {
		return await this.devices.get({ id });
	}

	public async getDevicesByUserId(userId: string): Promise<Device[]> {
		const result = await this.devices.find({
			user_id: userId,
		});

		return result.toArray();
	}

	public async upsertSensor(sensor: Sensor): Promise<void> {
		await this.sensors.insert(sensor);
	}

	public async getSensorById(
		deviceId: string,
		sensorId: string,
	): Promise<Sensor | null> {
		return await this.sensors.get({
			device: deviceId,
			id: sensorId,
		});
	}

	public async getSensorsByDeviceId(deviceId: string): Promise<Sensor[]> {
		const result = await this.sensors.find({ device: deviceId });

		return result.toArray();
	}

	public async upsertSensorReading(reading: Reading): Promise<void> {
		await this.readings.insert(reading);
		await this.updateDeviceLastRecord(reading.device, reading.time);
		await this.updateSensorLastRecord(
			reading.device,
			reading.sensor_id,
			reading.time,
		);
	}

	public async getSensorCorrections(
		deviceId: string,
		sensorType: SensorType,
	): Promise<Correction[]> {
		const result = await this.corrections.find({
			device: deviceId,
			reading_type: sensorType,
		});

		return result.toArray();
	}

	/**
	 * Query readings by either using PK or PK + CK.
	 */
	public async getDeviceReadingsOnDate(
		deviceId: string,
		date: Date,
		options?: GetReadingsOptions,
	): Promise<Reading[]> {
		const clusterKeyCriteria = options && {
			reading_type: options.sensor.type,
			sensor_id: options.sensor.id,
			processed: options.processed,
			time: q.and(q.gte(options.start), q.lte(options.end)),
		};

		const result = await this.readings.find({
			device: deviceId,
			date,
			...clusterKeyCriteria,
		});

		const readings = result.toArray().map((reading) => ({
			...reading,
			date: new Date(reading.date.toString()),
		}));

		return sortReadingsByTimeAsc(readings);
	}

	/**
	 * Get device readings on multiple dates.
	 *
	 * Since `reading_type` and `sensor_id` is missing,
	 * we have to manually filter the query result.
	 */
	public async getDeviceReadings({
		deviceId,
		start,
		end,
		processed,
	}: {
		deviceId: string;
		start: Date;
		end: Date;
		processed?: boolean;
	}): Promise<Reading[]> {
		const result = [];

		for (const date of eachDayOfInterval({ start, end })) {
			const readings = await this.getDeviceReadingsOnDate(deviceId, date);

			const filtered = readings.filter((reading) => {
				if (reading.time < start || reading.time > end) {
					return false;
				}

				return processed === undefined || processed === reading.processed;
			});

			result.push(...filtered);
		}

		return result;
	}

	/**
	 * Get sensor readings on multiple dates.
	 */
	public async getSensorReadings({
		sensor,
		processed,
		start,
		end,
	}: GetReadingsOptions): Promise<Reading[]> {
		const result = [];

		for (const date of eachDayOfInterval({ start, end })) {
			const readings = await this.getDeviceReadingsOnDate(sensor.device, date, {
				sensor,
				processed,
				start,
				end,
			});

			result.push(...readings);
		}

		return result;
	}

	/**
	 * Update device's latest record if the given time is later.
	 *
	 * Not using conditional update because:
	 * 1. We need a CQL like `UPDATE device SET last_record = ? WHERE last_record = null OR last_record < ?`,
	 * but `OR` is not supported in CQL. so we have to write 2 update statements to cover both conditions.
	 * 2. Conditional updates are lightweight transactions, which may affect
	 * performance during mass updating.
	 *
	 * @see [CQL conditionally updating columns](https://docs.datastax.com/en/cql-oss/3.3/cql/cql_reference/cqlUpdate.html#cqlUpdate__conditionally-updating-columns)
	 */
	private async updateDeviceLastRecord(
		deviceId: string,
		time: Date,
	): Promise<void> {
		const device = await this.getDeviceById(deviceId);

		if (device && (!device.last_record || device.last_record < time)) {
			await this.devices.update({
				id: deviceId,
				last_record: time,
			});
		}
	}

	/**
	 * Update sensor's latest record if the given time is later.
	 *
	 * Implementation is same as {@link updateDeviceLastRecord}.
	 */
	private async updateSensorLastRecord(
		deviceId: string,
		sensorId: string,
		time: Date,
	): Promise<void> {
		const sensor = await this.getSensorById(deviceId, sensorId);

		if (sensor && (!sensor.last_record || sensor.last_record < time)) {
			await this.sensors.update({
				device: deviceId,
				id: sensorId,
				last_record: time,
			});
		}
	}
}
