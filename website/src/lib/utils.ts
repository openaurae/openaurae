import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

import type { DeviceType, SensorType } from "@openaurae/types";

export function cn(...inputs: ClassValue[]) {
	return twMerge(clsx(inputs));
}

export function formatDeviceType(type: DeviceType): string {
	switch (type) {
		case "air_quality":
			return "Air Quality";
		case "nemo_cloud":
			return "Nemo Cloud";
		case "zigbee":
			return "Zigbee";
	}
}

export function formatSensorType(type: SensorType): string {
	switch (type) {
		case "nemo_cloud":
			return "Nemo Cloud";
		case "ptqs1005":
			return "PTQS1005";
		case "pms5003st":
			return "PMS5003";
		case "zigbee_temp":
			return "Temperature";
		case "zigbee_occupancy":
			return "Occupancy";
		case "zigbee_power":
			return "Power";
		case "zigbee_contact":
			return "Contact";
		case "zigbee_vibration":
			return "Vibration";
	}
}

export function formatBuilding(building: string | null): string {
	if (!building) {
		return "";
	}

	if (building.match(/^\d+/)) {
		return `Building ${building}`;
	}

	return building;
}
