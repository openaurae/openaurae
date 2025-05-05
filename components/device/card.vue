<script setup lang="ts">
import {
  type Device,
  DeviceTypes,
  type ReadingStatus,
  type Sensor,
} from "#shared/types";
import { formatDistanceToNow } from "date-fns";
import { tv } from "tailwind-variants";

const { device } = defineProps<{
  device: Device & ReadingStatus & { sensors: Sensor[] };
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

const { base, header, body, footer, tag, label, link } = card({
  type: device.type,
});
const isNemo = isNemoCloudDevice(device);
</script>

<template>
  <div :class="base()">
    <div :class="header()">
      <div class="flex flex-col">
        <h3 class="text-lg font-semibold text-gray-900">
          {{ device.name }}
        </h3>
        <h5 :class="label()">#{{ device.id }}</h5>
      </div>

      <span :class="tag()">{{ formatDeviceType(device.type) }}</span>
    </div>

    <div :class="body()">
      <DeviceField>
        <template #name>Readings Today</template>
        <template #value>{{ device.readings_today }}</template>
      </DeviceField>
      <DeviceField>
        <template #name>Last Update</template>
        <template #value>{{
          device.updated_at ? formatDistanceToNow(device.updated_at) : "NA"
        }}</template>
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
    <div :class="footer()">
      <div class="flex items-center gap-2 text-sm text-gray-500 font-semibold">
        <span>{{ device.sensors.length }}</span>
        sensors
      </div>
      <ULink to="/" :class="link()">View Details →</ULink>
    </div>
  </div>
</template>

<style scoped></style>
