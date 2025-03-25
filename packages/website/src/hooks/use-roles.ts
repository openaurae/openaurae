import { useAuth } from "@clerk/clerk-react";
import { Role } from "@openaurae/types";

export function useRoles(): { isAdmin: boolean } {
	const { has } = useAuth();

	if (!has) {
		return { isAdmin: false };
	}

	return {
		isAdmin: has({ role: Role.Admin }),
	};
}
