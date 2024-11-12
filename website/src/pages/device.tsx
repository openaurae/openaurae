import { subDays } from "date-fns";
import { RotateCw } from "lucide-react";
import { useMemo, useState } from "react";
import { Link, useParams } from "react-router-dom";

import { DefaultSection } from "@/components/default";
import {
	DeviceInformation,
	DeviceSensorsOverview,
} from "@/components/device/card";
import { DateTimeInput } from "@/components/input";
import { SensorInformation, SensorOverview } from "@/components/sensor/card";
import { SensorMetricChart } from "@/components/sensor/chart";
import { sensorMetricGroups } from "@/components/sensor/metrics";
import {
	Breadcrumb,
	BreadcrumbItem,
	BreadcrumbLink,
	BreadcrumbList,
	BreadcrumbPage,
	BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useDevice, useSensorReadings } from "@/hooks/use-device";
import { toast } from "@/hooks/use-toast";
import { Header } from "@/layouts/sidebar";
import { formatDeviceType, formatSensorType } from "@/lib/utils";
import { getOne } from "@openaurae/lib";
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

	const [sensorId, setSensorId] = useState<string | null>(null);

	const sensor = useMemo(() => {
		if (!device || !sensorId) {
			return null;
		}

		return getOne(device.sensors, (sensor) => sensor.id === sensorId);
	}, [sensorId, device]);

	if (!device) {
		return <Skeleton className="w-full h-full" />;
	}

	return (
		<>
			<PageHeader device={device} />
			<main className="h-full flex flex-col gap-8 p-8 pt-0">
				<div className="w-full grid lg:grid-cols-2 gap-6">
					<DeviceInformation device={device} />
					{sensor ? (
						<SensorInformation
							sensor={sensor}
							onClose={() => setSensorId(null)}
						/>
					) : (
						<DeviceSensorsOverview device={device} />
					)}
				</div>

				{sensor ? (
					<SensorMetricTabs sensor={sensor} />
				) : (
					<SensorTabs
						device={device}
						onSensorSelected={(sensor) => setSensorId(sensor.id)}
					/>
				)}
			</main>
		</>
	);
}

function SensorMetricTabs({ sensor }: { sensor: Sensor }) {
	const metricGroups = useMemo(() => sensorMetricGroups(sensor.type), [sensor]);
	const groupNames = useMemo(() => Object.keys(metricGroups), [metricGroups]);
	const [group, setGroup] = useState(groupNames[0]);
	const [end, setEnd] = useState(sensor.last_record ?? new Date());
	const [start, setStart] = useState(subDays(end, 1));
	const [timeRange, setTimeRange] = useState<{ start: Date; end: Date }>({
		start,
		end,
	});
	const { refresh } = useSensorReadings({ sensor, ...timeRange });

	return (
		<Tabs
			className="w-full h-full flex flex-col gap-4"
			value={group}
			onValueChange={setGroup}
		>
			<div className="flex justify-between items-center">
				<TabsList>
					{groupNames.map((name) => (
						<TabsTrigger key={name} value={name}>
							{name}
						</TabsTrigger>
					))}
				</TabsList>
				<div className="flex gap-4 items-center">
					<Button
						className="flex-none"
						size="icon"
						variant="outline"
						onClick={() => {
							setTimeRange({ start, end });
							refresh().then(() => {
								toast({
									title: "Refreshed Successful",
									description: "Sensor readings are updated.",
								});
							});
						}}
					>
						<RotateCw />
					</Button>
					<DateTimeInput dateTime={start} onDateTimeUpdated={setStart} />
					<span>To</span>
					<DateTimeInput dateTime={end} onDateTimeUpdated={setEnd} />
				</div>
			</div>

			{groupNames.map((name) => (
				<TabsContent className="w-full h-full mt-2" key={name} value={name}>
					<SensorMetricChart
						className="w-full h-full"
						sensor={sensor}
						start={timeRange.start}
						end={timeRange.end}
						metricNames={metricGroups[name]}
					/>
				</TabsContent>
			))}
		</Tabs>
	);
}

function SensorTabs({
	device,
	onSensorSelected,
}: {
	device: DeviceWithSensors;
	onSensorSelected: (sensor: Sensor) => void;
}) {
	const sensorTypes = useMemo(() => deviceSensorTypes[device.type], [device]);

	return (
		<Tabs
			className="w-full h-full flex flex-col gap-4 flex-1"
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
					className="w-full h-full mt-2"
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
