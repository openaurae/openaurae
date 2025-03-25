import { type Sensor, deviceSensorTypes } from "@openaurae/types";
import { Clock, Cpu, Edit, Hash, Tag, Unlink, X } from "lucide-react";

import {
	IoTCard,
	IoTCardAction,
	IoTCardActions,
	IoTCardContent,
	IoTCardHeader,
	IoTCardItem,
} from "@/components/iot-card";
import { UnpairSensor } from "@/components/sensor/delete";
import { EditSensor } from "@/components/sensor/edit";
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
					<span className="text-xs">
						{formatDateTime(sensor.last_record) || "N/A"}
					</span>
				</IoTCardItem>
			</IoTCardContent>
		</IoTCard>
	);
}

export type SensorInformationProps = SensorCardProps & {
	className?: string;
	onClose: () => void;
};

export function SensorInformation({
	className,
	sensor,
	onClose,
}: SensorInformationProps) {
	const isZigbeeSensor = deviceSensorTypes.zigbee.includes(sensor.type);

	return (
		<IoTCard className={className}>
			<IoTCardHeader title="Sensor Information">
				<IoTCardActions>
					<EditSensor sensor={sensor}>
						<IoTCardAction tooltip="Edit Sensor">
							<Edit />
						</IoTCardAction>
					</EditSensor>
					{isZigbeeSensor && (
						<UnpairSensor sensor={sensor} closeInfoCard={onClose}>
							<IoTCardAction tooltip="Unpair Sensor">
								<Unlink />
							</IoTCardAction>
						</UnpairSensor>
					)}
					<IoTCardAction tooltip="Close">
						<X onClick={onClose} />
					</IoTCardAction>
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
					{formatDateTime(sensor.last_record) || "N/A"}
				</IoTCardItem>
			</IoTCardContent>
		</IoTCard>
	);
}
