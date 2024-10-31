import { z } from "zod";

import { nonEmptyStringSchema } from "./helper";

/**
 * Schema of user records stored in the database.
 */
export const UserSchema = z.object({
	id: nonEmptyStringSchema,
	devices: z.string().array().optional().default([]),
});

export type User = z.infer<typeof UserSchema>;
