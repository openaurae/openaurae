import useSWR from "swr";
import useSWRImmutable from "swr/immutable";

import { useApiClient } from "@/hooks/use-api-client";
import {
	type AddDevice,
	type AddZigbeeSensor,
	type Device,
	type DeviceType,
	type DeviceWithSensors,
	type MetricName,
	type Reading,
	type Sensor,
	SensorSchema,
	type UpdateDevice,
	type UpdateSensor,
} from "@openaurae/types";
import { useCallback, useMemo } from "react";
import type { DateRange } from "react-day-picker";

export type UseDevicesOptions = {
	type?: DeviceType | null;
	building?: string | null;
};

export function useDevices(options: UseDevicesOptions = {}) {
	const { apiClient, getAccessToken, userId } = useApiClient();

	const {
		data: allDevices,
		isLoading,
		error,
		mutate,
	} = useSWR(["/api/v1/devices", userId], async ([url, _]) => {
		const resp = await apiClient.get<Device[]>(url, {
			headers: { Authorization: await getAccessToken() },
		});

		return resp.data;
	});

	const devices = useMemo(() => {
		if (!allDevices) {
			return undefined;
		}

		let result = allDevices;

		if (options.type) {
			result = result.filter((device) => device.type === options.type);
		}

		if (options.building) {
			result = result.filter((device) => device.building === options.building);
		}

		return result;
	}, [allDevices, options]);

	const addDevice = useCallback(
		async (device: AddDevice) => {
			await apiClient.post("/api/v1/devices", device, {
				headers: { Authorization: await getAccessToken() },
			});
			await mutate();
		},
		[apiClient, getAccessToken, mutate],
	);

	return {
		devices,
		isLoading,
		error,
		addDevice,
		mutate,
	};
}

export function useDevice(deviceId: string) {
	const { apiClient, getAccessToken, userId, baseURL } = useApiClient();

	const {
		data: device,
		isLoading,
		error,
		mutate,
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

	const updateDevice = useCallback(
		async (data: UpdateDevice) => {
			await apiClient.put(`/api/v1/devices/${deviceId}`, data, {
				headers: { Authorization: await getAccessToken() },
			});
			await mutate();
		},
		[apiClient, deviceId, getAccessToken, mutate],
	);

	const addZigbeeSensor = useCallback(
		async (sensor: AddZigbeeSensor) => {
			await apiClient.post(`/api/v1/devices/${deviceId}/sensors`, sensor, {
				headers: { Authorization: await getAccessToken() },
			});
			await mutate();
		},
		[apiClient, deviceId, getAccessToken, mutate],
	);

	const updateSensor = useCallback(
		async (sensorId: string, sensor: UpdateSensor) => {
			await apiClient.put(
				`/api/v1/devices/${deviceId}/sensors/${sensorId}`,
				sensor,
				{
					headers: { Authorization: await getAccessToken() },
				},
			);
			await mutate();
		},
		[apiClient, deviceId, getAccessToken, mutate],
	);

	const deleteSensor = useCallback(
		async (sensorId: string) => {
			await apiClient.delete(
				`/api/v1/devices/${deviceId}/sensors/${sensorId}`,
				{
					headers: { Authorization: await getAccessToken() },
				},
			);
			await mutate();
		},
		[apiClient, deviceId, getAccessToken, mutate],
	);

	return {
		device,
		isLoading,
		error,
		preSignReadings,
		updateDevice,
		addZigbeeSensor,
		updateSensor,
		deleteSensor,
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
