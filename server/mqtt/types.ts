import { z } from "zod/v4";

export const $Message = z.record(
  z.string(),
  z.union([z.string(), z.number(), z.boolean(), z.null()]),
);

export type Message = z.infer<typeof $Message>;
