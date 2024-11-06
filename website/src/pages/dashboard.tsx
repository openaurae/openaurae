import { Breadcrumb, BreadcrumbPage } from "@/components/ui/breadcrumb";
import { Header } from "@/layouts/sidebar";

export function DashboardPage() {
	return (
		<>
			<Header>
				<Breadcrumb>
					<BreadcrumbPage>Dashboard</BreadcrumbPage>
				</Breadcrumb>
			</Header>

			<div className="flex flex-1 flex-col gap-4 p-4 pt-0">Dashboard page</div>
		</>
	);
}
