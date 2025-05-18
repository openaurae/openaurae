import type { SensorType } from "#shared/types";
import { Kysely, PostgresDialect } from "kysely";
import { Pool, types } from "pg";

import { config } from "./config";
import type { Database, ReadingTable } from "./types";

export * from "./types";

const dialect = new PostgresDialect({
  pool: new Pool({
    ...config,
    max: 10,
  }),
});

// Map int8 to number (https://kysely.dev/docs/recipes/data-types)
types.setTypeParser(20, (val) => {
  return Number.parseInt(val, 10);
});

export function readingTable<T extends SensorType>(
  sensorType: T,
): ReadingTable {
  return `readings_${sensorType}`;
}

export const db = new Kysely<Database>({
  dialect,
});
