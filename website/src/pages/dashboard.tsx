import { ServerIp, TotalDevices } from "@/components/dashboard/card";
import { Breadcrumb, BreadcrumbPage } from "@/components/ui/breadcrumb";
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

			<div className="flex flex-1 flex-col gap-4 p-4 pt-0">
				<div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
					{DeviceTypeSchema.options.map((type) => (
						<TotalDevices key={type} type={type} />
					))}
					<ServerIp />
				</div>
			</div>
		</>
	);
}
