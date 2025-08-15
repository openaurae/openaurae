<script setup lang="ts">
import { $DeviceType } from "#shared/schema";
import type { SelectItem } from "@nuxt/ui";
import { useDevices } from "~/utils/use-devices";

const { isSignedIn } = useAuth();

const { data, refresh } = useDevices();

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

const { wrapper } = card({ size: "deviceOverview" });
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

    <PlaceHolder
      v-if="isDefined(data) && devices?.length === 0"
      text="No devices"
    />

    <div
      v-else
      class="w-full h-full min-h-[60vh] grid grid-cols-1 gap-8 md:grid-cols-3 lg:grid-cols-4"
    >
      <template v-if="!isDefined(data)">
        <USkeleton v-for="i in 8" :key="i" :class="wrapper()" />
      </template>
      <template v-else>
        <DeviceOverview
          v-for="device in devices"
          :key="device.id"
          :device="device"
        />
      </template>
    </div>
  </UContainer>
</template>

<style scoped></style>
