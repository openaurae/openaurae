import type { Sensor } from "@openaurae/types";
import { Clock, Cpu, Edit, Hash, Tag, X } from "lucide-react";

import { iconsVariants } from "@/components/icons";
import {
	IoTCard,
	IoTCardActions,
	IoTCardContent,
	IoTCardHeader,
	IoTCardItem,
} from "@/components/iot-card";
import { formatSensorType } from "@/lib/utils";
import { formatDateTime } from "@openaurae/lib";

export type SensorCardProps = {
	className?: string;
	sensor: Sensor;
};

export type SensorOverviewProps = SensorCardProps & {
	onSensorSelected: (sensor: Sensor) => void;
};

export function SensorOverview({
	sensor,
	onSensorSelected,
}: SensorOverviewProps) {
	return (
		<IoTCard clickable onClick={() => onSensorSelected(sensor)}>
			<IoTCardContent size="md" className="p-4">
				<IoTCardItem label={sensor.name || "N/A"} Icon={Cpu}>
					<span className="text-xs">{sensor.id}</span>
				</IoTCardItem>

				<IoTCardItem label="Last Record" Icon={Clock}>
					<span className="text-xs">{formatDateTime(sensor.last_record)}</span>
				</IoTCardItem>
			</IoTCardContent>
		</IoTCard>
	);
}

export type SensorInformationProps = SensorCardProps & {
	onClose: () => void;
};

export function SensorInformation({ sensor, onClose }: SensorInformationProps) {
	return (
		<IoTCard>
			<IoTCardHeader title={sensor.name || "N/A"}>
				<IoTCardActions>
					<Edit className={iconsVariants({ variant: "action" })} />
					<X
						className={iconsVariants({ variant: "action" })}
						onClick={onClose}
					/>
				</IoTCardActions>
			</IoTCardHeader>

			<IoTCardContent size="md">
				<IoTCardItem label="ID" Icon={Hash}>
					{sensor.id}
				</IoTCardItem>

				<IoTCardItem label="Name" Icon={Hash}>
					{sensor.name || "N/A"}
				</IoTCardItem>

				<IoTCardItem label="Type" Icon={Tag}>
					{formatSensorType(sensor.type)}
				</IoTCardItem>

				<IoTCardItem label="Last Record" Icon={Clock}>
					{formatDateTime(sensor.last_record)}
				</IoTCardItem>
			</IoTCardContent>
		</IoTCard>
	);
}
