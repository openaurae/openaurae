import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

import type { DeviceType } from "@openaurae/types";

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

export function formatBuilding(building: string | null): string {
	if (!building) {
		return "";
	}

	if (building.match(/^\d+/)) {
		return `Building ${building}`;
	}

	return building;
}
