<script setup lang="ts" generic="T extends SensorType">
import { SensorDeleteForm, SensorMetricExport } from "#components";
import { MetricsMetadata } from "#shared/metadata";
import type { GetSensorResult, SensorReading, SensorType } from "#shared/types";
import { isZigbeeSensor } from "#shared/utils";
import type { SelectItem } from "@nuxt/ui";
import { lightFormat, subHours } from "date-fns";

const { sensor } = defineProps<{
  sensor: GetSensorResult;
}>();

const emit = defineEmits<{
  sensorDeleted: [deviceId: string, sensorId: string];
  sensorUpdated: [];
}>();

const span = ref(24);
const spanOptions = ref<SelectItem[]>([
  { label: "Last 1 hour", value: 1 },
  { label: "Last 3 hours", value: 3 },
  { label: "Last 6 hours", value: 6 },
  { label: "Last 12 hours", value: 12 },
  { label: "Last 24 hours", value: 24 },
  { label: "Last 3 days", value: 24 * 3 },
  { label: "Last 7 days", value: 24 * 7 },
]);

const start = computed(() => subHours(new Date(), span.value));
const end = ref(new Date());

const reading = computed(
  () => (sensor.latest_reading as SensorReading<T>) ?? null,
);

const metricsMetadata = computed(() => MetricsMetadata[sensor.type as T]);

const formattedTime = computed(() =>
  reading.value?.time
    ? lightFormat(reading.value.time, "yyyy-MM-dd HH:mm:ss")
    : "NA",
);

function refresh() {
  end.value = new Date();
}

// bubble up
function onSensorDeleted(deviceId: string, sensorId: string) {
  emit("sensorDeleted", deviceId, sensorId);
}

// bubble up
function onSensorUpdated() {
  emit("sensorUpdated");
}
</script>

<template>
  <div class="grid gap-8">
    <section class="grid gap-6">
      <header class="grid gap-1">
        <div
          class="flex flex-col gap-1 lg:flex-row items-start justify-between"
        >
          <div class="flex items-center gap-4">
            <h2 class="text-2xl font-semibold">Sensor {{ sensor.name }}</h2>
            <SensorUpdateForm
              :sensor="sensor"
              @sensor-updated="onSensorUpdated"
            />
            <SensorDeleteForm
              v-if="isZigbeeSensor(sensor)"
              :device-id="sensor.device_id"
              :sensor-id="sensor.id"
              @sensor-deleted="onSensorDeleted"
            />
          </div>
          <div>
            <SensorMetricExport
              :device-id="sensor.device_id"
              :sensor-id="sensor.id"
            />
          </div>
        </div>

        <div class="text-sm text-muted">
          Latest metrics @ {{ formattedTime }}
        </div>
      </header>

      <div
        v-if="isDefined(reading)"
        class="grid grid-cols-2 lg:grid-cols-4 gap-4 my-2"
      >
        <SensorMetricCard
          v-for="metadata in metricsMetadata"
          :key="metadata.name"
          :metadata="metadata"
          :value="reading[metadata.name]"
        />
      </div>
      <PlaceHolder v-else text="No Sensor Reading" />
    </section>

    <section class="grid gap-6">
      <header class="flex flex-col md:flex-row justify-between gap-2">
        <h2 class="text-2xl font-semibold">Metrics History</h2>
        <div class="flex flex-row justify-between gap-4 items-center">
          <UButton
            icon="material-symbols:refresh"
            class="cursor-pointer"
            variant="subtle"
            @click="refresh"
          >
            Refresh
          </UButton>
          <USelect v-model="span" :items="spanOptions" class="w-40" />
        </div>
      </header>
      <SensorReadings
        :device-id="sensor.device_id"
        :sensor-id="sensor.id"
        :type="sensor.type"
        :start="start"
        :end="end"
      />
    </section>
  </div>
</template>

<style scoped></style>
