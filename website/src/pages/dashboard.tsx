import { ServerIp, TotalDevices } from "@/components/dashboard/card";
import { DevicesMap } from "@/components/dashboard/map";
import { Breadcrumb, BreadcrumbPage } from "@/components/ui/breadcrumb";
import { Card } from "@/components/ui/card";
import { Header } from "@/layouts/sidebar";
import { DeviceTypeSchema } from "@openaurae/types";

export function DashboardPage() {
	return (
		<>
			<Header>
				<Breadcrumb>
					<BreadcrumbPage>Dashboard</BreadcrumbPage>
				</Breadcrumb>
			</Header>

			<div className="flex flex-1 flex-col gap-6 p-4 pt-0">
				<div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
					{DeviceTypeSchema.options.map((type) => (
						<TotalDevices key={type} type={type} />
					))}
					<ServerIp />
				</div>

				<div className="grid gap-2">
					<h2 className="text-2xl font-medium">Device Map</h2>
					<p className="text-sm text-muted-foreground">
						Click on pins to view sensor information.
					</p>
				</div>

				<Card className="w-full h-full min-h-[300px] py-0 overflow-hidden">
					<DevicesMap
						mapStyle="mapbox://styles/mapbox/light-v9"
						viewPort={{
							latitude: -37.909365,
							longitude: 145.134424,
							zoom: 12,
						}}
					/>
				</Card>
			</div>
		</>
	);
}
