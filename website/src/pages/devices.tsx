import { useParams } from "react-router-dom";

import { Breadcrumb, BreadcrumbPage } from "@/components/ui/breadcrumb";
import { Header } from "@/layouts/sidebar";
import { type DeviceType, DeviceTypeSchema } from "@openaurae/types";

export function DevicesPage() {
	const params = useParams();

	const deviceType = DeviceTypeSchema.parse(params.deviceType);

	return (
		<>
			<Header>
				<Breadcrumb>
					<BreadcrumbPage>{deviceTypeNames[deviceType]} Devices</BreadcrumbPage>
				</Breadcrumb>
			</Header>

			<div className="flex flex-1 flex-col gap-4 p-4 pt-0">Cards</div>
		</>
	);
}

const deviceTypeNames: Record<DeviceType, string> = {
	zigbee: "Zigbee",
	air_quality: "Air Quality",
	nemo_cloud: "Nemo Cloud",
};
