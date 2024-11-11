import { Cloud, LayoutDashboard } from "lucide-react";
import { Link } from "react-router-dom";

import { DeviceTypeIcons } from "@/components/icons";
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
import { useBuildings } from "@/hooks/use-buildings";
import { formatBuilding } from "@/lib/utils";

export function AppSidebar() {
	const { buildings } = useBuildings();

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
								<Link to="/">
									<LayoutDashboard /> Overview
								</Link>
							</SidebarMenuButton>
						</SidebarMenuItem>
					</SidebarMenu>
				</SidebarGroup>

				<SidebarGroup>
					<SidebarGroupLabel>Devices</SidebarGroupLabel>
					<SidebarMenu>
						<SidebarMenuItem>
							<SidebarMenuButton asChild>
								<Link to="/devices?type=air_quality">
									<DeviceTypeIcons.air_quality /> Air Quality
								</Link>
							</SidebarMenuButton>
						</SidebarMenuItem>

						<SidebarMenuItem>
							<SidebarMenuButton asChild>
								<Link to="/devices?type=zigbee">
									<DeviceTypeIcons.zigbee /> Zigbee
								</Link>
							</SidebarMenuButton>
						</SidebarMenuItem>

						<SidebarMenuItem>
							<SidebarMenuButton asChild>
								<Link to="/devices?type=nemo_cloud">
									<DeviceTypeIcons.nemo_cloud /> Nemo Cloud
								</Link>
							</SidebarMenuButton>
							<SidebarMenuAction className="data-[state=open]:rotate-90">
								<span className="sr-only">Toggle</span>
							</SidebarMenuAction>
							<SidebarMenuSub>
								{buildings?.map((building) => (
									<SidebarMenuSubItem key={building}>
										<SidebarMenuSubButton asChild>
											<Link
												to={`/devices?type=nemo_cloud&building=${building}`}
											>
												{formatBuilding(building)}
											</Link>
										</SidebarMenuSubButton>
									</SidebarMenuSubItem>
								))}
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
