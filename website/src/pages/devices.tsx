import { useMemo, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { z } from "zod";

import { DefaultSection } from "@/components/default.tsx";
import { DeviceOverview } from "@/components/device/card";
import {
	Breadcrumb,
	BreadcrumbItem,
	BreadcrumbLink,
	BreadcrumbList,
	BreadcrumbPage,
	BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import { Button } from "@/components/ui/button.tsx";
import { Input } from "@/components/ui/input.tsx";
import { Skeleton } from "@/components/ui/skeleton";
import { useDevices } from "@/hooks/use-device";
import { toast } from "@/hooks/use-toast";
import { Header } from "@/layouts/sidebar";
import { formatBuilding, formatDeviceType } from "@/lib/utils";
import {
	type Device,
	type DeviceType,
	DeviceTypeSchema,
} from "@openaurae/types";
import { Plus } from "lucide-react";

const searchParamsSchema = z.object({
	type: DeviceTypeSchema,
	building: z.string().nullable(),
});

function searchDevices(devices: Device[], input: string | null): Device[] {
	if (!input) {
		return devices;
	}

	const target = input.toLowerCase();

	return devices.filter((device) => {
		return (
			device.id.toLowerCase().includes(target) ||
			device.name.toLowerCase().includes(target)
		);
	});
}

export function DevicesPage() {
	const [searchParams, _] = useSearchParams();
	const { type, building } = useMemo(() => {
		return searchParamsSchema.parse({
			type: searchParams.get("type"),
			building: searchParams.get("building"),
		});
	}, [searchParams]);

	const { devices, isLoading, error } = useDevices({ type, building });
	const [searchInput, setSearchInput] = useState<string | null>(null);

	if (error) {
		toast({
			title: "Error",
			description: `Failed to get devices: ${error.message}`,
		});
		return <DefaultSection message="Failed to load devices" />;
	}

	if (isLoading || !devices) {
		return <Skeleton className="w-full h-full rounded-2xl" />;
	}

	return (
		<>
			<PageHeader type={type} building={building} />

			<div className="flex flex-1 flex-col gap-6 p-6 pt-0">
				<div className="flex justify-between gap-4">
					<Input
						value={searchInput || ""}
						onChange={(e) => setSearchInput(e.target.value)}
						className="max-w-md"
						placeholder="Search id or name"
					/>
					{/*<Button>*/}
					{/*	<Plus /> Add Device*/}
					{/*</Button>*/}
				</div>
				<DeviceCards devices={searchDevices(devices, searchInput)} />
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

function DeviceCards({ devices }: { devices: Device[] }) {
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
