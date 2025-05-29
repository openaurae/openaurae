<script
  setup
  lang="ts"
  generic="T extends SensorType, K extends SensorMetricName<T>"
>
import type {
  SensorMetricMetadata,
  SensorMetricName,
  SensorType,
} from "#shared/types";

const { metadata, value } = defineProps<{
  metadata: SensorMetricMetadata<T, K>;
  value: unknown;
}>();

const { displayName, unit } = metadata;

function formatValue(value: unknown): string {
  if (typeof value === "string") {
    return value;
  }

  if (typeof value === "number") {
    return value.toString();
  }

  if (typeof value === "boolean") {
    return value ? "Yes" : "No";
  }

  return "NA";
}
</script>

<template>
  <div class="border border-accented shadow-sm rounded-lg p-4">
    <header class="font-semibold">
      {{ displayName }}
    </header>
    <div class="pt-4">
      <div class="align-bottom">
        <span class="font-bold text-2xl">{{ formatValue(value) }}</span>
        <span class="text-sm pl-1">{{ unit ?? "" }}</span>
      </div>
    </div>
  </div>
</template>

<style scoped></style>
