<script setup lang="ts">
import type { GetDeviceResult } from "#shared/types";
import { isNemoCloudDevice } from "#shared/utils";
import { card } from "~/utils/variants";

const { device } = defineProps<{
  device: GetDeviceResult | null;
}>();

const emit = defineEmits<{
  deviceUpdated: [];
}>();

const variants = computed(() =>
  card({
    theme: device?.type,
    size: "device_details",
  }),
);

const isNemo = computed(() => isNemoCloudDevice(device));
</script>

<template>
  <div v-if="!isDefined(device)">
    <USkeleton class="h-56 rounded-2xl" />
  </div>
  <div v-else :class="variants.wrapper()">
    <div :class="variants.header()">
      <div class="flex gap-4 items-center">
        <h2 :class="variants.title()">Device Details</h2>
        <DeviceUpdateForm
          v-if="device !== null && !isNemo"
          :device="device"
          @device-updated="emit('deviceUpdated')"
        />
      </div>
    </div>

    <div :class="variants.body()">
      <LabelValue>
        <template #label>Id</template>
        <template #value>{{ device.id }}</template>
      </LabelValue>

      <LabelValue>
        <template #label>Name</template>
        <template #value>{{ device.name }}</template>
      </LabelValue>

      <LabelValue>
        <template #label>Type</template>
        <template #value>{{ formatDeviceType(device.type) }}</template>
      </LabelValue>

      <LabelValue>
        <template #label>Sensor Count</template>
        <template #value>{{ device.sensors.length }}</template>
      </LabelValue>

      <LabelValue>
        <template #label>Latitude</template>
        <template #value>{{ device.latitude ?? "NA" }}</template>
      </LabelValue>
      <LabelValue>
        <template #label>Longitude</template>
        <template #value>{{ device.longitude ?? "NA" }}</template>
      </LabelValue>

      <LabelValue>
        <template #label>Building</template>
        <template #value>{{ device.building ?? "NA" }}</template>
      </LabelValue>
      <LabelValue>
        <template #label>Room</template>
        <template #value>{{ device.room ?? "NA" }}</template>
      </LabelValue>
    </div>
  </div>
</template>

<style scoped></style>
