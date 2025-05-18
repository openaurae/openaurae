<script setup lang="ts">
import { $DeviceWithSensorsAndStatus, type Sensor } from "#shared/types";
import { startOfDay } from "date-fns";

const route = useRoute();
const { user } = useUser();
const now = useNow();
const userId = ref(user?.value?.id);
const { data: device } = useFetch(`/api/devices/${route.params.deviceId}`, {
  watch: [userId],
  query: {
    startOfToday: startOfDay(now.value).toISOString(),
  },
  transform: $DeviceWithSensorsAndStatus.parse,
});
const deviceType = computed(() => device.value?.type);
const selectedSensor = ref<Sensor | null>(null);
</script>

<template>
  <UContainer class="py-10 min-h-screen w-full h-full flex flex-col gap-10">
    <DeviceDetails :device="device" />

    <section>
      <div class="flex flex-col">
        <div class="flex justify-between mb-2">
          <h2 class="text-2xl font-semibold">Sensors</h2>
          <!-- <UButton>Add</UButton> -->
        </div>
        <p class="text-sm text-(--ui-text-muted)">
          Scroll horizontally to view all sensors, click on a sensor to view
          details.
        </p>
      </div>

      <div class="w-full min-h-lg flex gap-10">
        <UCarousel
          v-slot="{ item: sensor }"
          class="w-full"
          :items="isDefined(device) ? device.sensors : [null, null, null]"
          :ui="{
            item: 'basis-auto my-4',
          }"
        >
          <SensorCard
            :sensor="sensor"
            :theme="
              isDefined(selectedSensor) && sensor?.id === selectedSensor.id
                ? deviceType
                : undefined
            "
            @sensor-selected="(sensor) => (selectedSensor = sensor)"
          />
        </UCarousel>
      </div>
    </section>

    <div v-if="isDefined(selectedSensor)">
      <h2 class="text-2xl font-semibold">Sensor {{ selectedSensor.name }}</h2>
    </div>
  </UContainer>
</template>

<style scoped></style>
