import { useAuth, useUser } from "@clerk/clerk-react";
import { ChevronsUpDown, Copy, LogOut } from "lucide-react";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuGroup,
	DropdownMenuItem,
	DropdownMenuLabel,
	DropdownMenuSeparator,
	DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { SidebarMenuButton } from "@/components/ui/sidebar";
import { useToast } from "@/hooks/use-toast";

export function UserProfile() {
	const { getToken, signOut } = useAuth();
	const { user, isSignedIn } = useUser();
	const { toast } = useToast();

	if (!isSignedIn || !user) {
		return null;
	}

	const email = user.primaryEmailAddress?.emailAddress ?? "NA";
	const fullName = `${user.firstName} ${user.lastName}`.trim() || "unknown";

	const copyAccessToken = async () => {
		const token = await getToken();

		if (token) {
			await navigator.clipboard.writeText(token);

			toast({
				title: "Copied",
				description: "Access token is copied to clipboard!",
			});
		}
	};

	return (
		<DropdownMenu>
			<DropdownMenuTrigger asChild>
				<SidebarMenuButton
					size="lg"
					className="data-[state=open]:bg-sidebar-accent data-[state=open]:text-sidebar-accent-foreground"
				>
					<Avatar className="h-8 w-8 rounded-lg">
						<AvatarImage src={user.imageUrl} alt={email} />
						<AvatarFallback className="rounded-lg">?</AvatarFallback>
					</Avatar>
					<div className="grid flex-1 text-left text-sm leading-tight">
						<span className="truncate font-semibold">{fullName}</span>
						<span className="truncate text-xs">{email}</span>
					</div>
					<ChevronsUpDown className="ml-auto size-4" />
				</SidebarMenuButton>
			</DropdownMenuTrigger>
			<DropdownMenuContent
				className="w-[--radix-dropdown-menu-trigger-width] min-w-56 rounded-lg"
				side="bottom"
				align="end"
				sideOffset={4}
			>
				<DropdownMenuLabel className="p-0 font-normal">
					<div className="flex items-center gap-2 px-1 py-1.5 text-left text-sm">
						<Avatar className="h-8 w-8 rounded-lg">
							<AvatarImage src={user.imageUrl} alt={email} />
							<AvatarFallback className="rounded-lg">CN</AvatarFallback>
						</Avatar>
						<div className="grid flex-1 text-left text-sm leading-tight">
							<span className="truncate font-semibold">{fullName}</span>
							<span className="truncate text-xs">{email}</span>
						</div>
					</div>
				</DropdownMenuLabel>
				<DropdownMenuSeparator />
				<DropdownMenuGroup>
					<DropdownMenuItem onClick={copyAccessToken}>
						<Copy />
						Copy Access Token
					</DropdownMenuItem>
				</DropdownMenuGroup>
				<DropdownMenuSeparator />
				<DropdownMenuItem className="text-red-500" onClick={() => signOut()}>
					<LogOut />
					Log out
				</DropdownMenuItem>
			</DropdownMenuContent>
		</DropdownMenu>
	);
}
