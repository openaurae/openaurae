<script setup lang="ts">
import type { DeviceType, Sensor, SensorWithStatus } from "#shared/types";
import { formatDistance } from "date-fns";
import { card } from "~/utils/variants";

const now = useNow();

const { sensor, theme } = defineProps<{
  theme?: DeviceType | "default";
  sensor: SensorWithStatus | null;
}>();

const variants = computed(() =>
  card({
    theme,
    size: "sm",
  }),
);

const emit = defineEmits<{
  sensorSelected: [sensor: Sensor];
}>();

const lastUpdateTime = computed(() => {
  if (!isDefined(sensor) || !sensor.last_update) {
    return "NA";
  }
  return formatDistance(sensor.last_update, now.value, {
    addSuffix: true,
    includeSeconds: true,
  });
});
</script>

<template>
  <USkeleton v-if="!isDefined(sensor)" :class="variants.wrapper()" />
  <div
    v-else
    :class="variants.wrapper({ class: 'cursor-pointer', theme })"
    @click="emit('sensorSelected', sensor)"
  >
    <div :class="variants.header()">
      <div class="flex flex-col">
        <h3 :class="variants.title()">
          {{ sensor.name }}
        </h3>
        <h5 class="text-xs text-(--ui-text-muted)">#{{ sensor.id }}</h5>
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
        <template #value> {{ lastUpdateTime }} </template>
      </LabelValue>
    </div>
  </div>
</template>

<style scoped></style>
