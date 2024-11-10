import { compareAsc, compareDesc } from "date-fns";

import type { Device, Reading, Sensor } from "@openaurae/types";

export function chunks<T>(array: T[], chunkSize = 10): T[][] {
	if (array.length === 0) {
		return [];
	}

	const chunks: T[][] = [];

	for (let i = 0; i < array.length; i = Math.min(i + chunkSize, array.length)) {
		chunks.push(array.slice(i, i + chunkSize));
	}

	return chunks;
}

export function sortDevicesByTimeDesc(devices: Device[]): Device[] {
	return devices.sort((d1, d2) => {
		const t1 = d1.last_record ?? 0;
		const t2 = d2.last_record ?? 0;

		if (t1 !== t2) {
			return compareDesc(t1, t2);
		}

		return d1.name < d2.name ? -1 : 1;
	});
}

export function sortSensorsByTimeDesc(sensors: Sensor[]): Sensor[] {
	return sensors.sort((s1, s2) => {
		const t1 = s1.last_record ?? 0;
		const t2 = s2.last_record ?? 0;

		if (t1 !== t2) {
			return compareDesc(t1, t2);
		}

		return s1.id < s2.id ? -1 : 1;
	});
}

export function sortReadingsByTimeAsc(readings: Reading[]): Reading[] {
	return readings.sort((r1, r2) => compareAsc(r1.time, r2.time));
}
