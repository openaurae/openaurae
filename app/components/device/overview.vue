<script setup lang="ts">
import { DeviceTypes } from "#shared/schema";
import type { GetDeviceResult } from "#shared/types";
import { formatDistanceToNow } from "date-fns";
import { card } from "~/utils/variants";

const { device } = defineProps<{
  device: GetDeviceResult;
}>();

const { wrapper, header, body, title, subtitle, text, badge, footer } = card({
  theme: device.type,
  size: "deviceOverview",
});

const isNemo = computed(() => device.type === DeviceTypes.NEMO_CLOUD);

const lastUpdateTime = computed(() => {
  if (!device.last_update) {
    return "NA";
  }
  return formatDistanceToNow(device.last_update, {
    addSuffix: true,
    includeSeconds: true,
  });
});

const sensorCount = computed(() => {
  const count = device.sensors?.length ?? 0;

  return count === 1 ? "1 sensor" : `${count} sensors`;
});

const detailsLink = computed(() => `/devices/${device.id}`);
</script>

<template>
  <ULink :to="detailsLink">
    <div :class="wrapper()">
      <div :class="header()">
        <div class="flex flex-col">
          <h3 :class="title()">
            {{ device.name }}
          </h3>
          <h5 :class="subtitle()">#{{ device.id }}</h5>
        </div>

        <span :class="badge()">{{ formatDeviceType(device.type) }}</span>
      </div>

      <div :class="body()">
        <LabelValue>
          <template #label>Readings Today</template>
          <template #value>{{ device.daily_reading_count }}</template>
        </LabelValue>
        <LabelValue>
          <template #label>Last Update</template>
          <template #value>{{ lastUpdateTime }}</template>
        </LabelValue>

        <LabelValue v-if="isNemo">
          <template #label>Building</template>
          <template #value>{{ device.building ?? "NA" }}</template>
        </LabelValue>
        <LabelValue v-else>
          <template #label>Latitude</template>
          <template #value>{{ device.latitude ?? "NA" }}</template>
        </LabelValue>

        <LabelValue v-if="isNemo">
          <template #label>Room</template>
          <template #value>{{ device.room ?? "NA" }}</template>
        </LabelValue>
        <LabelValue v-else>
          <template #label>Longitude</template>
          <template #value>{{ device.longitude ?? "NA" }}</template>
        </LabelValue>
      </div>

      <div :class="footer()">
        <p class="font-semibold text-md text-muted">
          {{ sensorCount }}
        </p>
        <span :class="text()">View Details →</span>
      </div>
    </div>
  </ULink>
</template>

<style scoped></style>
