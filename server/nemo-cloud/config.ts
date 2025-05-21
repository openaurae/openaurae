import z from "zod";

const $NemoAccount = z.object({
  url: z.string().url(),
  operator: z.string(),
  password: z.string(),
  company: z.string(),
});

const $NemoConfig = z.object({
  cloud: $NemoAccount,
  s5: $NemoAccount,
});

export type NemoAccount = z.infer<typeof $NemoAccount>;
export type NemoConfig = z.infer<typeof $NemoConfig>;
export type NemoVersion = keyof NemoConfig;

const runtimeConfig = useRuntimeConfig();

export const nemoConfig = $NemoConfig.parse(runtimeConfig.nemo);
