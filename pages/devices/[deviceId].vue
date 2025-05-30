<script setup lang="ts">
import {
  $Reading,
  type GetDeviceResult,
  type GetSensorResult,
} from "#shared/types";
import { isZigbeeDevice } from "#shared/utils";
import type { BreadcrumbItem } from "@nuxt/ui";
import { useEventSource } from "@vueuse/core";
import { isBefore, startOfDay } from "date-fns";
import { minTime } from "date-fns/constants";

const { deviceId } = useRoute().params;
const now = useNow();
const { data: device, refresh } = useFetch<GetDeviceResult>(
  `/api/devices/${deviceId}`,
  {
    query: {
      startOfToday: computed(() => startOfDay(now.value).toISOString()),
    },
  },
);

const isZigbee = computed(() => isZigbeeDevice(device.value));
const sensors = computed(() => device.value?.sensors ?? []);

const sensorById = computed<Record<string, GetSensorResult>>(() => {
  const entries = sensors.value.map((sensor) => [sensor.id, sensor]);
  return Object.fromEntries(entries);
});

const selectedSensor = ref<GetSensorResult | null>(null);

const { data: readingEvent, close } = useEventSource(
  `/api/devices/${deviceId}/sse`,
);

watch(readingEvent, (event) => {
  const reading = $Reading.parse(JSON.parse(event));
  const sensor = sensorById.value[reading.sensor_id];

  if (isBefore(sensor.last_update ?? minTime, reading.time)) {
    sensor.last_update = reading.time;
    sensor.latest_reading = reading;
    sensor.daily_reading_count++;
  }
});

onUnmounted(() => {
  close();
});

const items = computed<BreadcrumbItem[]>(() => [
  {
    label: "Devices",
    to: "/devices",
  },
  {
    label: device.value?.name,
    to: `/devices/${device.value?.id}`,
  },
]);

function onSensorSelected(sensor: GetSensorResult) {
  selectedSensor.value = sensor;
}

async function onSensorDeleted(deviceId: string, sensorId: string) {
  if (selectedSensor.value?.id === sensorId) {
    selectedSensor.value = null;
  }
  await refresh();
}

async function onDeviceUpdated() {
  await refresh();
}
</script>

<template>
  <UContainer class="py-10 min-h-screen w-full h-full flex flex-col gap-10">
    <UBreadcrumb :items="items" />
    <DeviceDetails :device="device" @device-updated="onDeviceUpdated" />

    <section>
      <div class="flex flex-col">
        <div class="flex justify-between mb-2">
          <h2 class="text-2xl font-semibold">Sensors</h2>
          <SensorCreateForm
            v-if="isDefined(device) && isZigbee"
            :device-id="device.id"
            @sensor-created="refresh"
          />
        </div>
        <p class="text-sm text-muted">
          Swipe to see all sensors. Tap any sensor to view its
          <b>real-time</b>
          metrics.
        </p>
      </div>

      <div v-if="sensors.length === 0" class="py-4">
        <PlaceHolder text="No sensors" />
      </div>
      <UCarousel
        v-else
        v-slot="{ item: sensor }"
        class="w-full"
        :items="sensors"
        :ui="{
          item: 'basis-auto',
          container: 'py-4',
        }"
      >
        <SensorOverview
          :is-selected="selectedSensor?.id === sensor?.id"
          :sensor="sensor"
          @sensor-selected="onSensorSelected"
        />
      </UCarousel>
    </section>

    <SensorDetails
      v-if="isDefined(selectedSensor)"
      :sensor="selectedSensor"
      @sensor-deleted="onSensorDeleted"
    />
  </UContainer>
</template>

<style scoped></style>
