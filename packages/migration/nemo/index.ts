import type { MigrationOptions } from "../config";
import { migrate } from "./migration";

export async function migrateNemoCloud(
	options?: MigrationOptions,
): Promise<void> {
	await migrate(
		{
			url: Bun.env.NEMO_URL,
			operator: Bun.env.NEMO_OPERATOR,
			password: Bun.env.NEMO_PASSWORD,
			company: Bun.env.NEMO_COMPANY,
		},
		options,
	);
}

export async function migrateS5NemoCloud(
	options?: MigrationOptions,
): Promise<void> {
	await migrate(
		{
			url: Bun.env.NEMO_S5_URL,
			operator: Bun.env.NEMO_S5_OPERATOR,
			password: Bun.env.NEMO_S5_PASSWORD,
			company: Bun.env.NEMO_S5_COMPANY,
		},
		options,
	);
}
