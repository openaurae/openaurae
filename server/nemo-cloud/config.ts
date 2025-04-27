import z from "zod";

const accountSchema = z.object({
  url: z.string().url(),
  operator: z.string(),
  password: z.string(),
  company: z.string(),
});

const configsSchema = z.object({
  cloud: accountSchema,
  s5: accountSchema,
});

export type Account = z.infer<typeof accountSchema>;
export type Configs = z.infer<typeof configsSchema>;

const runtimeConfig = useRuntimeConfig();

export const configs = configsSchema.parse(runtimeConfig.nemo);
