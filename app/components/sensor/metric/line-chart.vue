<script
  setup
  lang="ts"
  generic="T extends SensorType, K extends SensorMetricName<T>"
>
import type {
  SensorMetricMetadata,
  SensorMetricName,
  SensorReading,
  SensorType,
} from "#shared/types";
import { isNotNil } from "#shared/utils";

const { readings, metadata } = defineProps<{
  readings: SensorReading<T>[];
  metadata: SensorMetricMetadata<T, K>;
  end: Date;
}>();

const { name, displayName, unit, type } = metadata;

const data = readings
  .filter((reading) => isNotNil(reading[name]))
  .map((reading) => [reading.time, reading[name]]);

const option = ref<ECOption>({
  title: {
    text: displayName,
    left: "center",
    top: "3%",
  },
  tooltip: {
    trigger: "axis",
    axisPointer: { type: "cross" },
    valueFormatter: (value) => (unit ? `${value} ${unit}` : value?.toString()),
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
  <VChart v-if="type === 'number'" :option="option" autoresize />
</template>

<style scoped></style>
