<script setup lang="ts" generic="T extends SensorType">
import { MetricsMetadata } from "#shared/metadata";
import type { SensorReading, SensorType } from "#shared/types";

const { deviceId, sensorId, type, start, end } = defineProps<{
  deviceId: string;
  sensorId: string;
  type: T;
  start: Date;
  end: Date;
}>();

const debouncedStart = refDebounced(
  toRef(() => start),
  100,
);

const { data: readings } = useFetch<SensorReading<T>[]>(
  computed(() => `/api/devices/${deviceId}/sensors/${sensorId}/readings`),
  {
    query: {
      start: computed(() => debouncedStart.value.toISOString()),
      end: computed(() => end.toISOString()),
    },
    server: false,
  },
);

const metricsMetadata = computed(() => MetricsMetadata[type]);
</script>

<template>
  <div class="grid gap-10 lg:grid-cols-2">
    <div
      v-for="metadata in metricsMetadata"
      :key="metadata.name"
      class="w-[100%] h-[320px] border border-accented rounded-2xl shadow-lg overflow-hidden"
    >
      <USkeleton v-if="!isDefined(readings)" class="w-full h-full" />
      <SensorMetricLineChart
        v-else-if="metadata.type === 'number'"
        :metadata="metadata"
        :readings="readings"
        :key="`line-${end.toISOString()}`"
      />
      <SensorMetricBarChart
        v-else-if="metadata.type === 'boolean'"
        :metadata="metadata"
        :readings="readings"
        :key="`bar-${end.toISOString()}`"
      />
    </div>
  </div>
</template>

<style scoped></style>
