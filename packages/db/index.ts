import { Database } from "./database";

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

export { createKeyspaceAndTables, dropKeyspace } from "./migration";
export * from "./database";

export const db = Database.fromEnv();
