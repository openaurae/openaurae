import { Plus } from "lucide-react";
import { useMemo, useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { z } from "zod";

import { DefaultSection } from "@/components/default";
import { AddNewDevice } from "@/components/device/add";
import { DeviceOverview } from "@/components/device/card";
import {
	Breadcrumb,
	BreadcrumbItem,
	BreadcrumbLink,
	BreadcrumbList,
	BreadcrumbPage,
	BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { useDevices } from "@/hooks/use-device";
import { Header } from "@/layouts/sidebar";
import { formatBuilding, formatDeviceType } from "@/lib/utils";
import {
	type Device,
	type DeviceType,
	DeviceTypeSchema,
} from "@openaurae/types";
import { toast } from "sonner";

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
			type: DeviceTypeSchema.parse(searchParams.get("type")),
			building: searchParams.get("building"),
		});
	}, [searchParams]);

	const { devices, isLoading, error } = useDevices({ type, building });
	const [searchInput, setSearchInput] = useState<string | null>(null);

	if (error) {
		toast("Failed to get devices", {
			description: error?.message,
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
					{type !== "nemo_cloud" && (
						<AddNewDevice type={type}>
							<Button>
								<Plus /> Add Device
							</Button>
						</AddNewDevice>
					)}
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
		return <DefaultSection message="No devices found." />;
	}

	return (
		<div className="grid gap-6 justify-center md:grid-cols-2 lg:grid-cols-4 2xl:grid-cols-5">
			{devices.map((device) => (
				<Link key={device.id} to={`/devices/${device.id}`}>
					<DeviceOverview clickable device={device} />
				</Link>
			))}
		</div>
	);
}
