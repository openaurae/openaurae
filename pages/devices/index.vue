<script setup lang="ts">
import { $DeviceWithSensorsAndStatus } from "#shared/types";
import { startOfDay } from "date-fns";
import { tv } from "tailwind-variants";

const { user } = useUser();
const now = useNow();
const userId = ref(user?.value?.id);

const startOfToday = computed(() => startOfDay(now.value).toISOString());

const { data: devices, status } = useFetch("/api/devices", {
  watch: [userId, startOfToday],
  query: {
    startOfToday,
  },
  transform: $DeviceWithSensorsAndStatus.array().parse,
});

const container = tv({
  base: ["w-full h-full grid grid-cols-1 gap-6 place-content-center grow"],
  variants: {
    type: {
      cards: ["md:grid-cols-2 lg:grid-cols-3", "xl:grid-cols-4 xl:gap-10"],
      text: [
        "rounded-2xl bg-(--ui-bg-muted)",
        "text-xl text-center text-(--ui-text-highlighted)",
      ],
    },
  },
});
</script>

<template>
  <UContainer class="py-10 min-h-screen w-full h-full flex flex-col">
    <h1 class="text-2xl my-4">Devices</h1>

    <div
      v-if="status === 'pending' || !isDefined(devices)"
      :class="container({ type: 'cards' })"
    >
      <USkeleton
        v-for="i in 8"
        :key="i"
        class="w-[315px] h-[300px] rounded-2xl"
      />
    </div>

    <div v-else-if="status === 'error'" :class="container({ type: 'text' })">
      <span>Error loading devices</span>
    </div>

    <div v-else-if="devices.length === 0" :class="container({ type: 'text' })">
      <span>No devices</span>
    </div>

    <div v-else :class="container({ type: 'cards' })">
      <DeviceCard v-for="device in devices" :key="device.id" :device="device" />
    </div>
  </UContainer>
</template>

<style scoped></style>
