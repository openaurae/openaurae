import useSWR from "swr";

import { useApiClient } from "@/hooks/use-api-client";
import {
	type Device,
	type DeviceType,
	type DeviceWithSensors,
	type MetricName,
	type Reading,
	type Sensor,
	SensorSchema,
} from "@openaurae/types";
import { useCallback } from "react";
import type { DateRange } from "react-day-picker";
import useSWRImmutable from "swr/immutable";

export type UseDevicesOptions = {
	type?: DeviceType | null;
	building?: string | null;
};

export function useDevices(options: UseDevicesOptions = {}) {
	const { apiClient, getAccessToken, userId } = useApiClient();

	const {
		data: devices,
		isLoading,
		error,
	} = useSWR(["/api/v1/devices", userId, options], async ([url, _, params]) => {
		const resp = await apiClient.get<Device[]>(url, {
			headers: { Authorization: await getAccessToken() },
			params,
		});

		return resp.data;
	});

	return {
		devices,
		isLoading,
		error,
	};
}

export function useDevice(deviceId: string) {
	const { apiClient, getAccessToken, userId, baseURL } = useApiClient();

	const {
		data: device,
		isLoading,
		error,
	} = useSWR(
		userId ? [`/api/v1/devices/${deviceId}`, userId] : null,
		async ([url, _]) => {
			const { data: device } = await apiClient.get<DeviceWithSensors>(url, {
				headers: { Authorization: await getAccessToken() },
			});

			return {
				...device,
				sensors: SensorSchema.array().parse(device.sensors),
			};
		},
	);

	const preSignReadings = useCallback(
		async ({ from, to }: DateRange) => {
			const resp = await apiClient.get<{ key: string }>("pre-sign/readings", {
				headers: { Authorization: await getAccessToken() },
				params: {
					deviceId,
					start: from,
					end: to,
				},
			});

			const { key } = resp.data;

			return `${baseURL}/export/readings/${key}`;
		},
		[baseURL, deviceId, apiClient, getAccessToken],
	);

	return {
		device,
		isLoading,
		error,
		preSignReadings,
	};
}

export function useSensorReadings({
	sensor,
	start,
	end,
}: { sensor: Sensor; start: Date; end: Date; metricNames?: MetricName[] }) {
	const { apiClient, getAccessToken, userId } = useApiClient();

	const {
		data: readings,
		mutate: refresh,
		isLoading,
		error,
	} = useSWRImmutable(
		userId
			? [
					`/api/v1/devices/${sensor.device}/readings`,
					userId,
					sensor.id,
					start,
					end,
				]
			: null,
		async ([url, _, sensorId, start, end]) => {
			const resp = await apiClient.get<Reading[]>(url, {
				headers: { Authorization: await getAccessToken() },
				params: {
					sensorId,
					start,
					end,
					processed: true,
				},
			});

			return resp.data;
		},
	);

	return {
		readings,
		isLoading,
		error,
		refresh,
	};
}
