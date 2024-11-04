import { DefaultLayout } from "@/components/layout";
import { Breadcrumb, BreadcrumbPage } from "@/components/ui/breadcrumb";

export function DashboardPage() {
	const breadcrumb = (
		<Breadcrumb>
			<BreadcrumbPage>Overview</BreadcrumbPage>
		</Breadcrumb>
	);

	return (
		<DefaultLayout breadcrumb={breadcrumb}>
			<div>Dashboard Page</div>
		</DefaultLayout>
	);
}
