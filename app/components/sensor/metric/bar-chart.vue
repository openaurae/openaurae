<script setup lang="ts">
import type { Reading, SensorMetricMetadata, SensorType } from "#shared/types";
import { isNotNil } from "#shared/utils";

const { readings, metadata } = defineProps<{
  readings: Reading[];
  metadata: SensorMetricMetadata<SensorType>;
}>();

const { name, displayName } = metadata;

const Value = {
  YES: 1,
  NO: 0.1,
};

const data = readings
  .filter((reading) => isNotNil((reading as Record<string, unknown>)[name]))
  .map((reading) => [
    reading.time,
    (reading as Record<string, unknown>)[name] ? Value.YES : Value.NO,
  ]);

const option = ref<ECOption>({
  title: {
    text: displayName,
    left: "center",
    top: "3%",
  },
  tooltip: {
    trigger: "axis",
    axisPointer: {
      type: "shadow",
    },
    valueFormatter: (value) => (value === Value.YES ? "Yes" : "No"),
  },
  xAxis: {
    type: "time",
  },
  yAxis: {
    type: "value",
    interval: 1,
    min: 0,
    max: Value.YES,
    show: false,
  },
  series: [
    {
      data,
      name: displayName,
      type: "bar",
      barWidth: "25%",
    },
  ],
  grid: {
    left: "3%",
    right: "4%",
    bottom: "3%",
    containLabel: true,
  },
});
</script>

<template>
  <VChart :option="option" autoresize />
</template>

<style scoped></style>
