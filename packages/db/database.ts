import * as cassandra from "cassandra-driver";

import type {
	Correction,
	Device,
	Reading,
	Sensor,
	User,
} from "@openaurae/types";

declare module "bun" {
	/**
	 * Declaration of related environment variables.
	 *
	 * @see [Bun environment variables](https://bun.sh/docs/runtime/env)
	 * @see [Interface merging](https://www.typescriptlang.org/docs/handbook/declaration-merging.html#merging-interfaces)
	 */
	interface Env {
		CASSANDRA_HOST: string;
		CASSANDRA_KEYSPACE: string;
	}
}

type ModelMapper<T> = cassandra.mapping.ModelMapper<T>;
type _Reading = Reading & {
	date: cassandra.types.LocalDate;
};

export const q = cassandra.mapping.q;

export class Database {
	public readonly client: cassandra.Client;
	private readonly mapper: cassandra.mapping.Mapper;

	public readonly users: ModelMapper<User>;
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
				User: { tables: ["user"] },
				Device: { tables: ["device"] },
				Sensor: { tables: ["sensor"] },
				Reading: { tables: ["reading"] },
				Correction: { tables: ["correction"] },
			},
		});

		this.users = this.mapper.forModel("User");
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

	public async getDeviceById(id: string): Promise<Device | null> {
		return await this.devices.get({ id });
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

	public async upsertSensorReading(reading: Reading): Promise<void> {
		await this.readings.insert(reading);
		await this.updateDeviceLastRecord(reading.device, reading.time);
		await this.updateSensorLastRecord(
			reading.device,
			reading.sensor_id,
			reading.time,
		);
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
