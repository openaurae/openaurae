<script setup lang="ts">
import type { GetSensorResult } from "#shared/types";
import { formatDistance } from "date-fns";
import { sensorDeviceType } from "~/shared/utils";
import { card } from "~/utils/variants";

const now = useNow();

const { sensor, isSelected } = defineProps<{
  isSelected: boolean;
  sensor: GetSensorResult | null;
}>();

const emit = defineEmits<{
  sensorSelected: [sensor: GetSensorResult];
}>();

const theme = computed(() => {
  if (!sensor || !isSelected) {
    return "default";
  }

  return sensorDeviceType(sensor.type);
});

const variants = computed(() =>
  card({
    theme: theme.value,
    size: "sensorOverview",
  }),
);

const formattedLatestReadingTime = computed(() => {
  const lastUpdate = sensor?.latest_reading?.time;

  return lastUpdate
    ? formatDistance(lastUpdate, now.value, {
        addSuffix: true,
        includeSeconds: true,
      })
    : "NA";
});
</script>

<template>
  <USkeleton v-if="!isDefined(sensor)" :class="variants.wrapper()" />
  <div
    v-else
    :class="variants.wrapper({ class: 'cursor-pointer' })"
    @click="emit('sensorSelected', sensor)"
  >
    <div :class="variants.header()">
      <div class="flex flex-col">
        <h3 :class="variants.title()">
          {{ sensor.name }}
        </h3>
        <h5 class="text-xs text-muted">#{{ sensor.id }}</h5>
      </div>

      <span :class="variants.badge()">{{ formatSensorType(sensor.type) }}</span>
    </div>

    <div :class="variants.body()">
      <LabelValue orientation="horizontal">
        <template #label> Readings Today: </template>
        <template #value> {{ sensor.daily_reading_count }} </template>
      </LabelValue>

      <LabelValue orientation="horizontal">
        <template #label> Last Update: </template>
        <template #value> {{ formattedLatestReadingTime }} </template>
      </LabelValue>
    </div>
  </div>
</template>

<style scoped></style>
