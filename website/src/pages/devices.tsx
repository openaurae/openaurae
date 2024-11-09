import { useMemo } from "react";
import { useSearchParams } from "react-router-dom";
import { z } from "zod";

import { DeviceOverview } from "@/components/device/card";
import {
	Breadcrumb,
	BreadcrumbItem,
	BreadcrumbLink,
	BreadcrumbList,
	BreadcrumbPage,
	BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import { Skeleton } from "@/components/ui/skeleton";
import { useDevices } from "@/hooks/use-device";
import { useToast } from "@/hooks/use-toast";
import { Header } from "@/layouts/sidebar";
import { formatBuilding, formatDeviceType } from "@/lib/utils";
import {
	type Device,
	type DeviceType,
	DeviceTypeSchema,
} from "@openaurae/types";

const searchParamsSchema = z.object({
	type: DeviceTypeSchema,
	building: z.string().nullable(),
});

export function DevicesPage() {
	const { toast } = useToast();
	const [searchParams, _] = useSearchParams();
	const { type, building } = useMemo(() => {
		return searchParamsSchema.parse({
			type: searchParams.get("type"),
			building: searchParams.get("building"),
		});
	}, [searchParams]);

	const { devices, error } = useDevices({ type, building });

	if (error) {
		toast({
			title: "Error",
			description: `Failed to get devices: ${error.message}`,
		});
		return null;
	}

	return (
		<>
			<PageHeader type={type} building={building} />

			<div className="flex flex-1 flex-col gap-4 p-6 pt-0">
				<DeviceCards devices={devices} />
			</div>
		</>
	);
}

function PageHeader({
	type,
	building,
}: { type: DeviceType; building: string | null }) {
	return (
		<Header>
			<Breadcrumb>
				<BreadcrumbList>
					{building ? (
						<>
							<BreadcrumbItem>
								<BreadcrumbLink href={`/devices?type=${type}`}>
									{formatDeviceType(type)} Devices
								</BreadcrumbLink>
							</BreadcrumbItem>
							<BreadcrumbSeparator />
							<BreadcrumbItem>
								<BreadcrumbPage>{formatBuilding(building)}</BreadcrumbPage>
							</BreadcrumbItem>
						</>
					) : (
						<BreadcrumbItem>
							<BreadcrumbPage>{formatDeviceType(type)} Devices</BreadcrumbPage>
						</BreadcrumbItem>
					)}
				</BreadcrumbList>
			</Breadcrumb>
		</Header>
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
				<DeviceOverview key={device.id} device={device} />
			))}
		</div>
	);
}
