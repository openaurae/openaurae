import useSWR from "swr";

import { useApiClient } from "@/hooks/use-api-client";
import type { Device, DeviceType, DeviceWithSensors } from "@openaurae/types";

export type UseDevicesOptions = {
	type?: DeviceType | null;
	building?: string | null;
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

export function useDevice(deviceId: string) {
	const { accessToken, apiClient } = useApiClient();

	const {
		data: device,
		isLoading,
		error,
	} = useSWR(
		accessToken ? [`/api/v1/devices/${deviceId}`, accessToken] : null,
		async ([url, accessToken]) => {
			const resp = await apiClient.get<DeviceWithSensors>(url, {
				headers: { Authorization: `Bearer ${accessToken}` },
			});

			return resp.data;
		},
	);

	return {
		device,
		isLoading,
		error,
	};
}
