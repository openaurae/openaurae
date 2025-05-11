<script setup lang="ts">
import { DeviceTypes, type DeviceWithSensorsAndStatus } from "#shared/types";
import { formatDistanceToNow } from "date-fns";
import { tv } from "tailwind-variants";

const { device } = defineProps<{
  device: DeviceWithSensorsAndStatus;
}>();

const card = tv({
  slots: {
    base: [
      "rounded-xl overflow-hidden shadow-md border-white/70 backdrop-blur-lg",
      "transition-all duration-300 hover:translate-y-[-5px] hover:shadow-lg",
      "flex flex-col",
    ],
    header: ["flex items-center justify-between", "px-6 pt-4"],
    body: ["grid grid-cols-2 gap-4", "p-6 h-full", "grow"],
    footer: ["flex items-center justify-between", "bg-white", "px-6 py-4"],
    tag: [
      "bg-gradient-to-br from-slate-400 to-slate-700",
      "px-3 py-1 rounded-full",
      "text-xs font-semibold text-white tracking-wide",
    ],
    label: "text-xs text-gray-500",
    link: "text-sm font-semibold",
  },
  variants: {
    type: {
      [DeviceTypes.AIR_QUALITY]: {
        base: "bg-indigo-500/8",
        tag: "from-indigo-400 to-indigo-700",
        link: "text-indigo-600",
      },
      [DeviceTypes.ZIGBEE]: {
        base: "bg-emerald-500/8",
        tag: "from-emerald-400 to-emerald-700",
        link: "text-emerald-600",
      },
      [DeviceTypes.NEMO_CLOUD]: {
        base: "bg-amber-500/8",
        tag: "from-amber-400 to-amber-700",
        link: "text-amber-600",
      },
    },
  },
});

const slots = computed(() =>
  card({
    type: device.type,
  }),
);

const isNemo = computed(() => device.type === DeviceTypes.NEMO_CLOUD);

const lastUpdateTime = computed(() => {
  if (!device.last_update) {
    return "NA";
  }
  return formatDistanceToNow(device.last_update, {
    addSuffix: true,
  });
});

const sensorCount = computed(() => {
  const count = device.sensors?.length ?? 0;

  return count === 1 ? "1 sensor" : `${count} sensors`;
});

const detailsLink = computed(() => `/devices/${device.id}`);
</script>

<template>
  <div :class="slots.base()">
    <div :class="slots.header()">
      <div class="flex flex-col">
        <h3 class="text-lg font-semibold text-gray-900">
          {{ device.name }}
        </h3>
        <h5 :class="slots.label()">#{{ device.id }}</h5>
      </div>

      <span :class="slots.tag()">{{ formatDeviceType(device.type) }}</span>
    </div>

    <div :class="slots.body()">
      <DeviceField>
        <template #name>Readings Today</template>
        <template #value>{{ device.daily_reading_count }}</template>
      </DeviceField>
      <DeviceField>
        <template #name>Last Update</template>
        <template #value>{{ lastUpdateTime }}</template>
      </DeviceField>

      <DeviceField v-if="isNemo">
        <template #name>Building</template>
        <template #value>{{ device.building ?? "NA" }}</template>
      </DeviceField>
      <DeviceField v-else>
        <template #name>Latitude</template>
        <template #value>{{ device.latitude ?? "NA" }}</template>
      </DeviceField>

      <DeviceField v-if="isNemo">
        <template #name>Room</template>
        <template #value>{{ device.room ?? "NA" }}</template>
      </DeviceField>
      <DeviceField v-else>
        <template #name>Longitude</template>
        <template #value>{{ device.longitude ?? "NA" }}</template>
      </DeviceField>
    </div>
    <!-- class="flex justify-between items-center px-6 py-4 bg-gray-500/7 border-t border-black/5" -->
    <div :class="slots.footer()">
      <p class="flex items-center gap-2 text-sm text-gray-500 font-semibold">
        {{ sensorCount }}
      </p>
      <ULink :to="detailsLink" :class="slots.link()">View Details →</ULink>
    </div>
  </div>
</template>

<style scoped></style>
