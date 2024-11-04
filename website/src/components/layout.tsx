import { UserButton } from "@clerk/clerk-react";
import {
	Collapsible,
	CollapsibleContent,
	CollapsibleTrigger,
} from "@radix-ui/react-collapsible";
import { ChevronRight } from "lucide-react";
import type { ReactNode } from "react";

import { Separator } from "@/components/ui/separator";
import {
	Sidebar,
	SidebarContent,
	SidebarFooter,
	SidebarGroup,
	SidebarGroupLabel,
	SidebarHeader,
	SidebarInset,
	SidebarMenu,
	SidebarMenuAction,
	SidebarMenuButton,
	SidebarMenuItem,
	SidebarMenuSub,
	SidebarMenuSubButton,
	SidebarMenuSubItem,
	SidebarProvider,
	SidebarTrigger,
} from "@/components/ui/sidebar";

export type DefaultLayoutProps = {
	children: ReactNode;
	breadcrumb: ReactNode;
};

export function DefaultLayout({ children, breadcrumb }: DefaultLayoutProps) {
	return (
		<SidebarProvider>
			<AppSidebar />
			<SidebarInset>
				<header className="flex h-16 shrink-0 items-center gap-2">
					<div className="flex items-center gap-2 px-4">
						<SidebarTrigger className="-ml-1" />
						<Separator orientation="vertical" className="mr-2 h-4" />
						{breadcrumb}
					</div>
				</header>
				<div className="flex flex-1 flex-col gap-4 p-4 pt-0">{children}</div>
			</SidebarInset>
		</SidebarProvider>
	);
}

function AppSidebar() {
	return (
		<Sidebar variant="inset">
			<SidebarHeader>
				<SidebarMenu>
					<SidebarMenuItem>
						<SidebarMenuButton size="lg" asChild>
							<a href="/">
								<div className="flex aspect-square size-6 items-center justify-center rounded-lg ">
									<img src="/logo.svg" alt="OpenAurae Logo" />
								</div>
								<p className="text-md leading-tight truncate font-semibold">
									OpenAurae
								</p>
							</a>
						</SidebarMenuButton>
					</SidebarMenuItem>
				</SidebarMenu>
			</SidebarHeader>
			<SidebarContent>
				<SidebarGroup>
					<SidebarGroupLabel>Dashboard</SidebarGroupLabel>

					<SidebarMenu>
						<SidebarMenuItem>
							<SidebarMenuButton>
								<a href="/">Overview</a>
							</SidebarMenuButton>
						</SidebarMenuItem>
					</SidebarMenu>
				</SidebarGroup>

				<SidebarGroup>
					<SidebarGroupLabel>Devices</SidebarGroupLabel>
					<SidebarMenu>
						<SidebarMenuItem>
							<SidebarMenuButton asChild>
								<a href="/devices/air_quality">Air Quality</a>
							</SidebarMenuButton>
						</SidebarMenuItem>

						<Collapsible asChild>
							<SidebarMenuItem>
								<SidebarMenuButton asChild>
									<a href="/devices/zigbee">Zigbee</a>
								</SidebarMenuButton>
							</SidebarMenuItem>
						</Collapsible>

						<Collapsible asChild>
							<SidebarMenuItem>
								<SidebarMenuButton asChild>
									<a href="/devices/nemo_cloud">Nemo Cloud</a>
								</SidebarMenuButton>
								<CollapsibleTrigger asChild>
									<SidebarMenuAction className="data-[state=open]:rotate-90">
										<ChevronRight />
										<span className="sr-only">Toggle</span>
									</SidebarMenuAction>
								</CollapsibleTrigger>
								<CollapsibleContent>
									<SidebarMenuSub>
										<SidebarMenuSubItem>
											<SidebarMenuSubButton asChild>
												<span>Building 60</span>
											</SidebarMenuSubButton>
										</SidebarMenuSubItem>
										<SidebarMenuSubItem>
											<SidebarMenuSubButton asChild>
												<span>Building 66</span>
											</SidebarMenuSubButton>
										</SidebarMenuSubItem>
									</SidebarMenuSub>
								</CollapsibleContent>
							</SidebarMenuItem>
						</Collapsible>
					</SidebarMenu>
				</SidebarGroup>
				<SidebarGroup />
			</SidebarContent>

			<SidebarFooter>
				<SidebarMenu>
					<UserButton />
				</SidebarMenu>
			</SidebarFooter>
		</Sidebar>
	);
}
