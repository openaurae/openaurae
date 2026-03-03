<script setup lang="ts">
import type { Reading, SensorMetricMetadata, SensorType } from "#shared/types";
import { isNotNil } from "#shared/utils";

const { readings, metadata } = defineProps<{
  readings: Reading[];
  metadata: SensorMetricMetadata<SensorType>;
}>();

const { name, displayName, unit } = metadata;

const data = readings
  .filter((reading) => isNotNil((reading as Record<string, unknown>)[name]))
  .map((reading) => [
    reading.time,
    (reading as Record<string, unknown>)[name],
  ]) as [Date, number][];

const option = ref<ECOption>({
  title: {
    text: displayName,
    left: "center",
    top: "3%",
  },
  tooltip: {
    trigger: "axis",
    axisPointer: { type: "cross" },
    valueFormatter: (value) =>
      unit ? `${value} ${unit}` : String(value ?? ""),
  },
  xAxis: {
    type: "time",
  },
  yAxis: {
    type: "value",
    axisLabel: {
      formatter: unit ? `{value} ${unit}` : undefined,
    },
  },
  series: [
    {
      data,
      name: displayName,
      type: "line",
      smooth: true,
      showSymbol: false,
      lineStyle: {},
      areaStyle: {
        opacity: 0.4,
      },
      emphasis: {
        focus: "series",
      },
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
