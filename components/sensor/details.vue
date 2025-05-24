<script setup lang="ts">
import type { GetSensorResult } from "#shared/types";
import { lightFormat } from "date-fns";

const { sensor } = defineProps<{
  sensor: GetSensorResult;
}>();

const formattedTime = computed(() =>
  sensor.latest_reading?.time
    ? lightFormat(sensor.latest_reading.time, "yyyy-MM-dd HH:mm:ss")
    : "NA",
);
</script>

<template>
  <div class="flex flex-col gap-2">
    <h2 class="text-2xl font-semibold">Sensor {{ sensor.name }}</h2>
    <div class="text-sm text-muted">Latest Reading @ {{ formattedTime }}</div>

    <SensorMetrics :sensor-type="sensor.type" :latest="sensor.latest_reading" />
  </div>
</template>

<style scoped></style>
