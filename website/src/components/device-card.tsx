import { Clock, Eye, Hash, MapPin } from "lucide-react";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { formatDateTime } from "@openaurae/lib";
import type { Device } from "@openaurae/types";

export type DeviceCardProps = {
	device: Device;
};

export function DeviceCard({ device }: DeviceCardProps) {
	return (
		<Card className="w-full min-w-sm shadow-md hover:shadow-xl transition-shadow bg-linear-to-br from-blue-50 via-blue-50/40 to-blue-100">
			<CardHeader className="space-y-1">
				<div className="flex items-center justify-between">
					<CardTitle className="text-xl font-bold">
						{device.name || "UNKNOWN"}
					</CardTitle>
					<a href={`/devices/${device.id}`}>
						<Eye className="h-5 w-5 text-gray-500" />
					</a>
				</div>
			</CardHeader>
			<CardContent className="space-y-4">
				<div className="space-y-2 grid gap-1">
					<div className="flex items-center space-x-2">
						<Hash className="h-4 w-4 text-gray-500" />
						<div className="text-sm">
							<span className="font-medium">ID</span>
							<div className="text-gray-600">{device.id}</div>
						</div>
					</div>

					<div className="flex items-center space-x-2">
						<MapPin className="h-4 w-4 text-gray-500" />
						<div className="text-sm">
							<span className="font-medium">Location</span>
							<div className="text-gray-600">
								{device.type === "nemo_cloud" ? (
									<>
										<p>Building: {device.building ?? "N/A"}</p>
										<p>Room: {device.room ?? "N/A"}</p>
									</>
								) : (
									<>
										<p>Lat: {device.latitude ?? "N/A"}</p>
										<p>Long: {device.longitude ?? "N/A"}</p>
									</>
								)}
							</div>
						</div>
					</div>

					<div className="flex items-center space-x-2">
						<Clock className="h-4 w-4 text-gray-500" />
						<div className="text-sm">
							<span className="font-medium">Last Record</span>
							<div className="text-gray-600">
								{formatDateTime(device.last_record) || "N/A"}
							</div>
						</div>
					</div>
				</div>
			</CardContent>
		</Card>
	);
}
