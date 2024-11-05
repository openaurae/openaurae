import { endOfToday, startOfYesterday } from "date-fns";
import type { MigrationOptions } from "./config";

declare module "bun" {
	/**
	 * Declaration of related environment variables.
	 *
	 * @see [Bun environment variables](https://bun.sh/docs/runtime/env)
	 * @see [Interface merging](https://www.typescriptlang.org/docs/handbook/declaration-merging.html#merging-interfaces)
	 */
	interface Env {
		NEMO_URL: string;
		NEMO_OPERATOR: string;
		NEMO_PASSWORD: string;
		NEMO_COMPANY: string;

		NEMO_S5_URL: string;
		NEMO_S5_OPERATOR: string;
		NEMO_S5_PASSWORD: string;
		NEMO_S5_COMPANY: string;
	}
}

export * from "./aws";
export * from "./nemo";

export type MigrateOptions = Pick<MigrationOptions, "taskNum"> & {
	getStartDate?: () => Date;
	getEndDate?: () => Date;
	intervalInHours?: number;
};
export type Migrate = (options?: MigrationOptions) => Promise<void>;

/**
 * Periodically migrate data from the cloud server.
 *
 * @see [recursive setTimeout](https://nodejs.org/en/learn/asynchronous-work/discover-javascript-timers#recursive-settimeout)
 */
export function periodicallyMigrate(
	migrate: Migrate,
	{
		getStartDate = startOfYesterday,
		getEndDate = endOfToday,
		intervalInHours = 8,
		taskNum,
	}: MigrateOptions = {},
): void {
	const migrateOnce = () => {
		migrate({
			start: getStartDate(),
			end: getEndDate(),
			taskNum,
		}).then(() => {
			// schedule the next migration after the current one is finished
			setTimeout(migrate, intervalInHours * 60 * 60 * 1000);
		});
	};

	migrateOnce();
}
