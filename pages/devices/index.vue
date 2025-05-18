<script setup lang="ts">
import { $DeviceType, $DeviceWithSensorsAndStatus } from "#shared/types";
import type { SelectItem } from "@nuxt/ui";
import { startOfDay } from "date-fns";
import { tv } from "tailwind-variants";

const { user } = useUser();
const userId = computed(() => user?.value?.id);

const now = useNow();
const startOfToday = computed(() => startOfDay(now.value).toISOString());

const { data, status } = useFetch("/api/devices", {
  watch: [userId],
  query: {
    startOfToday,
  },
  transform: $DeviceWithSensorsAndStatus.array().parse,
});

const deviceTypeSelections = ref(
  $DeviceType.options.map((type) => ({
    value: type,
    label: formatDeviceType(type),
  })) satisfies SelectItem[],
);

const deviceTypes = ref([...$DeviceType.options]);

const allDevices = computed(() => data.value ?? []);
const devices = useArrayFilter(allDevices, (device) =>
  deviceTypes.value.includes(device.type),
);

const container = tv({
  base: ["w-full h-full min-h-[60vh]"],
  variants: {
    type: {
      cards: ["grid grid-cols-1 gap-8 md:grid-cols-3 lg:grid-cols-4"],
      placeholder:
        "rounded-xl bg-(--ui-bg-muted) flex justify-center items-center",
    },
  },
});
</script>

<template>
  <UContainer class="py-10 min-h-screen w-full h-full flex flex-col">
    <div class="flex justify-between items-center">
      <h1 class="text-2xl my-4">Devices</h1>
      <USelect
        v-model="deviceTypes"
        multiple
        :items="deviceTypeSelections"
        placeholder="Select Device Types"
        class="w-50"
        color="neutral"
        variant="subtle"
        size="lg"
      />
    </div>

    <div v-if="status === 'pending'" :class="container({ type: 'cards' })">
      <USkeleton
        v-for="i in 8"
        :key="i"
        class="w-[315px] h-[300px] rounded-2xl"
      />
    </div>

    <div
      v-else-if="devices.length === 0"
      :class="container({ type: 'placeholder' })"
    >
      <span class="text-md text-(--ui-text-muted)">No devices</span>
    </div>

    <div v-else :class="container({ type: 'cards' })">
      <DeviceOverview
        v-for="device in devices"
        :key="device.id"
        :device="device"
      />
    </div>
  </UContainer>
</template>

<style scoped></style>
