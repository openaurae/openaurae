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
}
