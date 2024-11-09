import { useCallback, useState } from "react";
import { Link, useParams } from "react-router-dom";

import { DefaultSection } from "@/components/default";
import {
	DeviceInformation,
	DeviceSensorsOverview,
} from "@/components/device/card";
import { SensorInformation, SensorOverview } from "@/components/sensor/card";
import {
	Breadcrumb,
	BreadcrumbItem,
	BreadcrumbLink,
	BreadcrumbList,
	BreadcrumbPage,
	BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import { Skeleton } from "@/components/ui/skeleton";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useDevice } from "@/hooks/use-device";
import { Header } from "@/layouts/sidebar";
import { formatDeviceType, formatSensorType } from "@/lib/utils";
import {
	type Device,
	type DeviceWithSensors,
	type Sensor,
	type SensorType,
	deviceSensorTypes,
} from "@openaurae/types";

export function DevicePage() {
	const { deviceId } = useParams();
	const { device } = useDevice(deviceId as string);
	const [selectedSensor, setSelectedSensor] = useState<Sensor | null>(null);
	const onSensorSelected = useCallback((sensor: Sensor) => {
		setSelectedSensor(sensor);
	}, []);

	if (!device) {
		return <Skeleton className="w-full h-full" />;
	}

	const sensorTypes = deviceSensorTypes[device.type];

	return (
		<>
			<PageHeader device={device} />
			<main className="flex flex-1 flex-col gap-4 p-8 pt-0">
				<div className="w-full grid lg:grid-cols-2 gap-6">
					<DeviceInformation device={device} />
					{selectedSensor ? (
						<SensorInformation
							sensor={selectedSensor}
							onClose={() => setSelectedSensor(null)}
						/>
					) : (
						<DeviceSensorsOverview device={device} />
					)}
				</div>

				<Tabs
					className="w-full h-full flex flex-col gap-4 flex-1 mt-2"
					defaultValue={sensorTypes[0]}
				>
					<div className="flex justify-between">
						<h2 className="text-xl font-semibold">Sensors</h2>
						<TabsList>
							{sensorTypes.map((sensorType) => (
								<TabsTrigger key={sensorType} value={sensorType}>
									{formatSensorType(sensorType)}
								</TabsTrigger>
							))}
						</TabsList>
					</div>

					{sensorTypes.map((sensorType) => (
						<TabsContent
							className="w-full h-full"
							key={sensorType}
							value={sensorType}
						>
							<SensorOverviews
								device={device}
								sensorType={sensorType}
								onSensorSelected={onSensorSelected}
							/>
						</TabsContent>
					))}
				</Tabs>
			</main>
		</>
	);
}

function SensorOverviews({
	device,
	sensorType,
	onSensorSelected,
}: {
	device: DeviceWithSensors;
	sensorType: SensorType;
	onSensorSelected: (sensor: Sensor) => void;
}) {
	const sensors = device.sensors.filter((sensor) => sensor.type === sensorType);

	if (sensors.length === 0) {
		return <DefaultSection message="No sensors." />;
	}

	return (
		<div className="w-full grid gap-8 sm:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4">
			{sensors.map((sensor) => (
				<SensorOverview
					key={sensor.id}
					sensor={sensor}
					onSensorSelected={onSensorSelected}
				/>
			))}
		</div>
	);
}

function PageHeader({ device }: { device: Device }) {
	return (
		<Header>
			<Breadcrumb>
				<BreadcrumbList>
					<BreadcrumbItem>
						<BreadcrumbLink asChild>
							<Link to={`/devices?type=${device.type}`}>
								{formatDeviceType(device.type)} Devices
							</Link>
						</BreadcrumbLink>
					</BreadcrumbItem>
					<BreadcrumbSeparator />
					<BreadcrumbItem>
						<BreadcrumbPage>{device.id}</BreadcrumbPage>
					</BreadcrumbItem>
				</BreadcrumbList>
			</Breadcrumb>
		</Header>
	);
}
