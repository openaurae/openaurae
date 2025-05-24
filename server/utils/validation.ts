import type { H3Event } from "h3";
import { fromError } from "zod-validation-error";
import type { ZodSchema } from "zod/v4";

const Validators = {
  body: readValidatedBody,
  query: getValidatedQuery,
  params: getValidatedRouterParams,
} as const;

export async function validateRequest<T>(
  event: H3Event,
  target: keyof typeof Validators,
  schema: ZodSchema<T>,
): Promise<T> {
  const validator = Validators[target];
  const { error, data } = await validator(event, schema.safeParseAsync);

  if (error) {
    throw createError({
      statusCode: 400,
      message: fromError(error).toString(),
    });
  }

  return data;
}
