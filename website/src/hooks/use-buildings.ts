import useSWR from "swr";

import { useApiClient } from "@/hooks/use-api-client";

export function useBuildings() {
	const { accessToken, apiClient } = useApiClient();

	const {
		data: buildings,
		isLoading,
		error,
	} = useSWR(
		accessToken ? ["/api/v1/buildings", accessToken] : null,
		async ([url, accessToken]) => {
			const resp = await apiClient.get<string[]>(url, {
				headers: { Authorization: `Bearer ${accessToken}` },
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
