import { Kysely, PostgresDialect } from "kysely";
import { Pool } from "pg";

import { config } from "./config";
import type { Database } from "./types";

export * from "./types";

const dialect = new PostgresDialect({
  pool: new Pool({
    ...config,
    max: 10,
  }),
});

export const db = new Kysely<Database>({
  dialect,
});
