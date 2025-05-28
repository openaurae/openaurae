<script setup lang="ts">
import { $DeviceType, type GetDeviceResult } from "#shared/types";
import type { SelectItem } from "@nuxt/ui";
import { startOfDay } from "date-fns";
import { tv } from "tailwind-variants";

const { isSignedIn } = useAuth();

const now = useNow();
const startOfToday = computed(() => startOfDay(now.value).toISOString());

const { data, status, refresh } = useFetch<GetDeviceResult[]>("/api/devices", {
  query: {
    startOfToday,
  },
});

const deviceTypeSelections = ref(
  $DeviceType.options.map((type) => ({
    value: type,
    label: formatDeviceType(type),
  })) satisfies SelectItem[],
);

const deviceTypes = ref([...$DeviceType.options]);
const searchInput = ref("");
const searched = computed(() => searchInput.value?.trim().toLowerCase());

const allDevices = computed(() => data.value ?? []);
const devices = useArrayFilter(allDevices, (device) => {
  if (!deviceTypes.value.includes(device.type)) {
    return false;
  }

  if (!searched.value) {
    return true;
  }

  return (
    device.id.toLowerCase().includes(searched.value) ||
    device.name.toLowerCase().includes(searched.value)
  );
});

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
  <UContainer
    class="md:pt-4 pb-10 min-h-screen w-full h-full flex flex-col gap-4"
  >
    <header
      class="flex flex-col md:flex-row md:justify-between md:items-center"
    >
      <h1 class="text-2xl my-4">Devices</h1>
      <div class="flex flex-col md:flex-row gap-4">
        <DeviceCreateForm v-if="isSignedIn" @device-created="refresh" />
        <USelect
          v-model="deviceTypes"
          multiple
          :items="deviceTypeSelections"
          placeholder="Select Device Types"
          class="w-full md:w-50"
          color="neutral"
          variant="outline"
          size="lg"
        />
        <UInput
          v-model="searchInput"
          color="neutral"
          variant="outline"
          size="lg"
          placeholder="Search by Id or Name..."
          class="w-full md:w-50"
        />
      </div>
    </header>

    <div v-if="status === 'pending'" :class="container({ type: 'cards' })">
      <USkeleton
        v-for="i in 8"
        :key="i"
        class="w-[315px] h-[300px] rounded-2xl"
      />
    </div>

    <PlaceHolder v-else-if="devices.length === 0" text="No devices" />

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
