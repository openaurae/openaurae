import {
	Building,
	Clock,
	Cpu,
	Download,
	Edit,
	Hash,
	House,
	MapPin,
	Plus,
	Tag,
} from "lucide-react";
import { useMemo } from "react";
import { Link } from "react-router-dom";

import { EditDevice } from "@/components/device/edit.tsx";
import { ExportReadings } from "@/components/device/export.tsx";
import {
	IoTCard,
	IoTCardAction,
	IoTCardActions,
	IoTCardContent,
	IoTCardHeader,
	IoTCardItem,
} from "@/components/iot-card";
import { AddSensor } from "@/components/sensor/add.tsx";
import { formatDeviceType, formatSensorType } from "@/lib/utils";
import { formatDateTime } from "@openaurae/lib";
import {
	type Device,
	type DeviceWithSensors,
	type SensorType,
	deviceSensorTypes,
} from "@openaurae/types";

export type DeviceCardProps<Dev extends Device> = {
	device: Dev;
	className?: string;
};

export function DeviceOverview({ device, className }: DeviceCardProps<Device>) {
	return (
		<Link to={`/devices/${device.id}`}>
			<IoTCard clickable className={className}>
				<IoTCardHeader title={device.name || "N/A"} />
				<IoTCardContent size="sm">
					<IoTCardItem label="ID" Icon={Hash}>
						{device.id}
					</IoTCardItem>

					{device.type === "nemo_cloud" ? (
						<IoTCardItem label="Location" Icon={MapPin}>
							<p>Building: {device.building ?? "N/A"}</p>
							<p>Room: {device.room ?? "N/A"}</p>
						</IoTCardItem>
					) : (
						<IoTCardItem label="Location" Icon={MapPin}>
							<p>Lat: {device.latitude ?? "N/A"}</p>
							<p>Long: {device.longitude ?? "N/A"}</p>
						</IoTCardItem>
					)}

					<IoTCardItem label="Last Record" Icon={Clock}>
						{formatDateTime(device.last_record) || "N/A"}
					</IoTCardItem>
				</IoTCardContent>
			</IoTCard>
		</Link>
	);
}

export function DeviceInformation({
	device,
	className,
}: DeviceCardProps<Device>) {
	return (
		<IoTCard className={className}>
			<IoTCardHeader title="Device Information">
				<IoTCardActions>
					{device.type !== "nemo_cloud" && (
						<EditDevice device={device}>
							<IoTCardAction tooltip="Edit Device">
								<Edit />
							</IoTCardAction>
						</EditDevice>
					)}
					<ExportReadings device={device}>
						<IoTCardAction tooltip="Export Device Readings">
							<Download />
						</IoTCardAction>
					</ExportReadings>
				</IoTCardActions>
			</IoTCardHeader>
			<IoTCardContent size="md">
				<IoTCardItem label="ID" Icon={Hash}>
					{device.id}
				</IoTCardItem>

				<IoTCardItem label="Name" Icon={Hash}>
					{device.name}
				</IoTCardItem>

				<IoTCardItem label="Type" Icon={Tag}>
					{formatDeviceType(device.type)}
				</IoTCardItem>

				<IoTCardItem label="Last Record" Icon={Clock}>
					{formatDateTime(device.last_record) || "N/A"}
				</IoTCardItem>

				{device.type === "nemo_cloud" ? (
					<>
						<IoTCardItem label="Building" Icon={Building}>
							{device.building ?? "N/A"}
						</IoTCardItem>

						<IoTCardItem label="Room" Icon={House}>
							{device.room ?? "N/A"}
						</IoTCardItem>
					</>
				) : (
					<>
						<IoTCardItem label="Latitude" Icon={MapPin}>
							{device.latitude ?? "N/A"}
						</IoTCardItem>

						<IoTCardItem label="Longitude" Icon={MapPin}>
							{device.longitude ?? "N/A"}
						</IoTCardItem>
					</>
				)}
			</IoTCardContent>
		</IoTCard>
	);
}

export function DeviceSensorsOverview({
	device,
	className,
}: DeviceCardProps<DeviceWithSensors>) {
	const countsByType = useMemo(() => {
		const map = new Map<SensorType, number>();

		for (const sensor of device.sensors) {
			const count = map.get(sensor.type) ?? 0;
			map.set(sensor.type, count + 1);
		}

		return map;
	}, [device]);

	return (
		<IoTCard className={className}>
			<IoTCardHeader title="Sensor Counts by Type">
				<IoTCardActions>
					{device.type === "zigbee" && (
						<AddSensor deviceId={device.id}>
							<IoTCardAction tooltip="Add Sensor">
								<Plus />
							</IoTCardAction>
						</AddSensor>
					)}
				</IoTCardActions>
			</IoTCardHeader>

			<IoTCardContent size="md">
				{deviceSensorTypes[device.type].map((type) => (
					<IoTCardItem key={type} label={formatSensorType(type)} Icon={Cpu}>
						{countsByType.get(type) ?? 0}
					</IoTCardItem>
				))}
			</IoTCardContent>
		</IoTCard>
	);
}
