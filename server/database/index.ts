import { Kysely, PostgresDialect } from "kysely";
import { Pool, types } from "pg";

import { config } from "./config";
import type { Database } from "./types";

export * from "./types";
export * from "./schemas";

const dialect = new PostgresDialect({
  pool: new Pool({
    ...config,
    max: 10,
  }),
});

// Map int8 to number (https://kysely.dev/docs/recipes/data-types)
types.setTypeParser(20, (val) => {
  return parseInt(val, 10);
});

export const db = new Kysely<Database>({
  dialect,
});
