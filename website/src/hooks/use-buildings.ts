import useSWR from "swr";

import { useApiClient } from "@/hooks/use-api-client";

export function useBuildings() {
	const { getAccessToken, userId, apiClient } = useApiClient();

	const {
		data: buildings,
		isLoading,
		error,
	} = useSWR(
		userId ? ["/api/v1/buildings", userId] : null,
		async ([url, _]) => {
			const resp = await apiClient.get<string[]>(url, {
				headers: { Authorization: await getAccessToken() },
			});

			return resp.data;
		},
	);

	return {
		buildings,
		isLoading,
		error,
	};
}
