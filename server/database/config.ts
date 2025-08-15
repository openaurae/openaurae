import { useRuntimeConfig } from "#imports";

import * as z from "zod";

const runtimeConfig = useRuntimeConfig();

const schema = z.object({
  database: z.string().min(1),
  host: z.string().min(1),
  port: z.coerce.number().positive(),
  user: z.string().min(1),
  password: z.string().min(1),
});

export const config = schema.parse(runtimeConfig.db);
