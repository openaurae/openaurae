import useSWR from "swr";

import { useApiClient } from "@/hooks/use-api-client";
import type { Device, DeviceType } from "@openaurae/types";

export type UseDevicesOptions = {
	type?: DeviceType;
	building?: string;
};

export function useDevices(options: UseDevicesOptions = {}) {
	const { accessToken, apiClient } = useApiClient();

	const {
		data: devices,
		isLoading,
		error,
	} = useSWR(
		accessToken ? ["/api/v1/devices", accessToken, options] : null,
		async ([url, accessToken, params]) => {
			const resp = await apiClient.get<Device[]>(url, {
				headers: { Authorization: `Bearer ${accessToken}` },
				params,
			});

			return resp.data;
		},
	);

	return {
		devices,
		isLoading,
		error,
	};
}
