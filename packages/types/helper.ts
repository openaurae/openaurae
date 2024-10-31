import { z } from "zod";

/**
 * If user leave blank for an optional numeric input,
 * the Zod schema will parse an empty string to a number,
 * which is `0` instead of `null`.
 *
 * ```javascript
 * Number(""); // 0
 * z.coerce.number().parse(""); // 0
 * ```
 *
 * So we have to manually convert `""` to `null` before
 * parsing the value using the Zod schema.
 */
export function emptyStringToNull(value: unknown): unknown {
	return value === "" ? null : value;
}

export const nonEmptyStringSchema = z.string().trim().min(1, "cannot be empty");
