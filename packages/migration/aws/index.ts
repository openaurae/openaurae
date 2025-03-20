import { chunks } from "@openaurae/lib";
import type { Device } from "@openaurae/types";
import type { MigrationOptions } from "../config";
import { AwsOpenAuraeMigration } from "./migration";

/**
 * Migrate data from the previous version of the server on AWS.
 *
 * @deprecated server has already retired
 * @param options
 */
export async function migrateAwsOpenAurae(
	options: MigrationOptions = {},
): Promise<void> {
	// start and end are required by GraphQL API
	const {
		start = new Date("2020-01-01"),
		end = new Date(),
		taskNum = 10,
	} = options ?? {};

	const migration = new AwsOpenAuraeMigration();

	const devices = await migration.migrateDevices();

	const migrateReadings = async (devices: Device[]) => {
		for (const device of devices) {
			await migration.migrateDeviceReadings(device, start, end);
		}
	};

	const devicesPerTask = Math.ceil(devices.length / taskNum);
	const tasks = chunks(devices, devicesPerTask).map(migrateReadings);

	await Promise.all(tasks);
}
