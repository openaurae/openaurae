import { ChevronRight, Cloud, LayoutDashboard } from "lucide-react";
import { Link } from "react-router-dom";

import { DeviceTypeIcons } from "@/components/icons";
import {
	Collapsible,
	CollapsibleContent,
	CollapsibleTrigger,
} from "@/components/ui/collapsible";
import {
	Sidebar,
	SidebarContent,
	SidebarFooter,
	SidebarGroup,
	SidebarGroupLabel,
	SidebarHeader,
	SidebarMenu,
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
							<SidebarMenuButton>
								<DeviceTypeIcons.air_quality />
								<Link to="/devices?type=air_quality">Air Quality</Link>
							</SidebarMenuButton>
						</SidebarMenuItem>

						<SidebarMenuItem>
							<SidebarMenuButton>
								<DeviceTypeIcons.zigbee />
								<Link to="/devices?type=zigbee">Zigbee</Link>
							</SidebarMenuButton>
						</SidebarMenuItem>

						<Collapsible asChild defaultOpen className="group/collapsible">
							<SidebarMenuItem>
								<CollapsibleTrigger asChild>
									<SidebarMenuButton>
										<DeviceTypeIcons.nemo_cloud />
										<Link to="/devices?type=nemo_cloud">Nemo Cloud</Link>
										<ChevronRight className="cursor-pointer ml-auto transition-transform duration-200 group-data-[state=open]/collapsible:rotate-90" />
									</SidebarMenuButton>
								</CollapsibleTrigger>
								<CollapsibleContent>
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
								</CollapsibleContent>
							</SidebarMenuItem>
						</Collapsible>
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
