<script setup lang="ts">
import type { Reading, SensorType } from "#shared/types";

const { sensorType, latest } = defineProps<{
  sensorType: SensorType;
  latest: Reading | null;
}>();

const metrics = computed(() =>
  latest ? metricsWithMetadata(sensorType, latest) : null,
);
</script>

<template>
  <div
    v-if="isDefined(metrics)"
    class="grid grid-cols-2 lg:grid-cols-4 gap-4 my-2"
  >
    <div
      v-for="metric in metrics"
      :key="metric.name"
      class="border border-muted rounded-lg p-4"
    >
      <header class="font-semibold">
        {{ metric.displayName }}
      </header>
      <div class="pt-4">
        <div
          v-if="metric.value !== null && metric.value !== undefined"
          class="align-bottom"
        >
          <span class="font-bold text-2xl">{{ metric.value }}</span>
          <span class="text-sm pl-1">{{ metric.unit ?? "" }}</span>
        </div>
        <div v-else class="font-bold text-2xl">NA</div>
      </div>
    </div>
  </div>
  <PlaceHolder v-else text="No Sensor Reading" />
</template>

<style scoped></style>
