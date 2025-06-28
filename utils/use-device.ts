import type { GetDeviceResult } from "#shared/types";
import { startOfDay } from "date-fns";

export function useDevice(deviceId: string) {
  const now = useNow();
  return useFetch<GetDeviceResult>(`/api/devices/${deviceId}`, {
    query: {
      startOfToday: computed(() => startOfDay(now.value).toISOString()),
    },
  });
}
