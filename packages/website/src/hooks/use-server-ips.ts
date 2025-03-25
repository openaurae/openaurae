import useSWR from "swr";

import { useApiClient } from "@/hooks/use-api-client";
import { useRoles } from "@/hooks/use-roles";

export function useServerIps() {
	const { userId, getAccessToken, apiClient } = useApiClient();
	const { isAdmin } = useRoles();

	const {
		data: ips,
		isLoading,
		error,
	} = useSWR(isAdmin ? ["/api/ips", userId] : null, async ([url, _]) => {
		const resp = await apiClient.get<string[]>(url, {
			headers: { Authorization: await getAccessToken() },
		});

		return resp.data;
	});

	return {
		ips,
		isLoading,
		error,
	};
}
