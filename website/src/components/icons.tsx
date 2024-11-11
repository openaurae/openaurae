import { cva } from "class-variance-authority";
import {
	CloudDownload,
	HardDriveUpload,
	Link,
	Radio,
	Thermometer,
	Users,
	Vibrate,
	Wind,
	Zap,
} from "lucide-react";
import type { ComponentType, SVGAttributes } from "react";

import type { DeviceType, SensorType } from "@openaurae/types";

export const iconsVariants = cva("text-gray-500", {
	variants: {
		variant: {
			action: "cursor-pointer h-5 w-5 hover:text-gray-400",
			label: "h-4 w-4",
		},
	},
});

export const DeviceTypeIcons: Record<
	DeviceType,
	ComponentType<SVGAttributes<object>>
> = {
	zigbee: Radio,
	air_quality: Wind,
	nemo_cloud: CloudDownload,
};

export const SensorTypeIcons: Record<
	SensorType,
	ComponentType<SVGAttributes<object>>
> = {
	zigbee_temp: Thermometer,
	zigbee_power: Zap,
	zigbee_vibration: Vibrate,
	zigbee_occupancy: Users,
	zigbee_contact: Link,
	pms5003st: Wind,
	ptqs1005: Wind,
	nemo_cloud: HardDriveUpload,
};
