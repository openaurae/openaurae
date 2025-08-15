import type { GetDeviceResult } from "#shared/types";
import { startOfDay } from "date-fns";

export function useDevices() {
  const now = useNow();
  const startOfToday = computed(() => startOfDay(now.value).toISOString());

  return useFetch<GetDeviceResult[]>("/api/devices", {
    query: {
      startOfToday,
    },
    server: false,
    cache: "no-cache",
  });
}
