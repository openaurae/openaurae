import { useMemo } from "react";
import { useParams } from "react-router-dom";

import { DeviceCard } from "@/components/device-card";
import { Breadcrumb, BreadcrumbPage } from "@/components/ui/breadcrumb";
import { Skeleton } from "@/components/ui/skeleton";
import { useDevices } from "@/hooks/use-device";
import { useToast } from "@/hooks/use-toast";
import { Header } from "@/layouts/sidebar";
import {
	type Device,
	type DeviceType,
	DeviceTypeSchema,
} from "@openaurae/types";

export function DevicesPage() {
	const { toast } = useToast();
	const params = useParams();
	const deviceType = useMemo(
		() => DeviceTypeSchema.parse(params.deviceType),
		[params],
	);

	const { devices, error } = useDevices({ type: deviceType });

	if (error) {
		toast({
			title: "Error",
			description: `Failed to get devices: ${error.message}`,
		});
		return null;
	}

	return (
		<>
			<Header>
				<Breadcrumb>
					<BreadcrumbPage>{deviceTypeNames[deviceType]} Devices</BreadcrumbPage>
				</Breadcrumb>
			</Header>

			<div className="flex flex-1 flex-col gap-4 p-4 pt-0">
				<DeviceCards devices={devices} />
			</div>
		</>
	);
}

function DeviceCards({ devices }: { devices: Device[] | undefined }) {
	if (!devices) {
		return <Skeleton className="w-full h-full rounded-2xl" />;
	}

	if (devices.length === 0) {
		return (
			<div className="w-full h-full flex justify-center items-center">
				<p className="text-lg">No device.</p>
			</div>
		);
	}

	return (
		<div className="grid gap-6 justify-center md:grid-cols-2 lg:grid-cols-4 2xl:grid-cols-5">
			{devices.map((device) => (
				<DeviceCard key={device.id} device={device} />
			))}
		</div>
	);
}

const deviceTypeNames: Record<DeviceType, string> = {
	zigbee: "Zigbee",
	air_quality: "Air Quality",
	nemo_cloud: "Nemo Cloud",
};
