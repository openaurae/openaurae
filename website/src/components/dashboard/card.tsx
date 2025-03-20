import { differenceInDays } from "date-fns";
import { Server } from "lucide-react";

import { DeviceTypeIcons, iconsVariants } from "@/components/icons";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { useDevices } from "@/hooks/use-device";
import { useRoles } from "@/hooks/use-roles";
import { useServerIps } from "@/hooks/use-server-ips";
import { formatDeviceType } from "@/lib/utils";
import type { Device, DeviceType } from "@openaurae/types";

export type TotalDevicesProps = {
	type: DeviceType;
};

export function TotalDevices({ type }: TotalDevicesProps) {
	const { devices, isLoading } = useDevices({ type });

	if (isLoading || !devices) {
		return <Skeleton className="w-full h-full rounded-2xl" />;
	}

	const active = activeDeviceNumber(devices);
	const Icon = DeviceTypeIcons[type];

	return (
		<Card className="bg-linear-to-br from-gray-100 via-white to-gray-100">
			<CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
				<CardTitle className="text-sm font-medium">
					{formatDeviceType(type)} Devices
				</CardTitle>
				<Icon className={iconsVariants({ variant: "action" })} />
			</CardHeader>
			<CardContent className="grid grid-cols-2">
				<div>
					<span className="text-3xl font-bold text-green-600">{active}</span>
					<span className="text-xs font-medium text-muted-foreground pl-2">
						Active
					</span>
				</div>
				<div>
					<span className="text-3xl font-bold">{devices.length}</span>
					<span className="text-xs font-medium text-muted-foreground pl-2">
						Total
					</span>
				</div>
			</CardContent>
		</Card>
	);
}

export function ServerIp() {
	const { isAdmin } = useRoles();
	const { ips, isLoading } = useServerIps();

	if (!isAdmin || isLoading || !ips) {
		return <Skeleton className="w-full h-full rounded-2xl" />;
	}

	const ip = ips.length > 0 ? ips[0] : "N/A";

	return (
		<Card className="bg-linear-to-br from-gray-100 via-white to-gray-100">
			<CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
				<CardTitle className="text-sm font-medium">Server IP</CardTitle>
				<Server className={iconsVariants({ variant: "action" })} />
			</CardHeader>
			<CardContent className="text-3xl font-semibold">{ip}</CardContent>
		</Card>
	);
}

function activeDeviceNumber(devices: Device[]): number {
	const now = new Date();

	const activeDevices = devices.filter(
		({ last_record }) => last_record && differenceInDays(now, last_record) <= 1,
	);

	return activeDevices.length;
}
