import { Cloud } from "lucide-react";

import {
	Sidebar,
	SidebarContent,
	SidebarFooter,
	SidebarGroup,
	SidebarGroupLabel,
	SidebarHeader,
	SidebarMenu,
	SidebarMenuAction,
	SidebarMenuButton,
	SidebarMenuItem,
	SidebarMenuSub,
	SidebarMenuSubButton,
	SidebarMenuSubItem,
} from "@/components/ui/sidebar";
import { UserProfile } from "@/components/user-profile";

export function AppSidebar() {
	return (
		<Sidebar variant="inset">
			<SidebarHeader>
				<SidebarMenu>
					<SidebarMenuItem>
						<SidebarMenuButton size="lg" asChild>
							<a href="/">
								<div className="flex aspect-square size-8 items-center justify-center rounded-lg bg-sidebar-primary text-sidebar-primary-foreground">
									<Cloud />
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
							<SidebarMenuButton asChild>
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

						<SidebarMenuItem>
							<SidebarMenuButton asChild>
								<a href="/devices/zigbee">Zigbee</a>
							</SidebarMenuButton>
						</SidebarMenuItem>

						<SidebarMenuItem>
							<SidebarMenuButton asChild>
								<a href="/devices/nemo_cloud">Nemo Cloud</a>
							</SidebarMenuButton>
							<SidebarMenuAction className="data-[state=open]:rotate-90">
								<span className="sr-only">Toggle</span>
							</SidebarMenuAction>
							<SidebarMenuSub>
								<SidebarMenuSubItem>
									<SidebarMenuSubButton asChild>
										<a href="/devices?building=60">Building 60</a>
									</SidebarMenuSubButton>
								</SidebarMenuSubItem>
								<SidebarMenuSubItem>
									<SidebarMenuSubButton asChild>
										<span>Building 66</span>
									</SidebarMenuSubButton>
								</SidebarMenuSubItem>
							</SidebarMenuSub>
						</SidebarMenuItem>
					</SidebarMenu>
				</SidebarGroup>
				<SidebarGroup />
			</SidebarContent>

			<SidebarFooter>
				<SidebarMenu>
					<SidebarMenuItem>
						<UserProfile />
					</SidebarMenuItem>
				</SidebarMenu>
			</SidebarFooter>
		</Sidebar>
	);
}
