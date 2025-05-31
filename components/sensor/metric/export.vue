<script setup lang="ts">
import {
  DateFormatter,
  getLocalTimeZone,
  today,
} from "@internationalized/date";
import {
  endOfDay,
  formatISO,
  minutesToMilliseconds,
  startOfDay,
} from "date-fns";
import type { SignedKey } from "~/server/database";

const { deviceId, sensorId } = defineProps<{
  deviceId: string;
  sensorId: string;
}>();

const { data: key, refresh } = await useFetch<SignedKey>("/api/keys", {
  method: "POST",
});

useIntervalFn(refresh, minutesToMilliseconds(1));

const tz = getLocalTimeZone();

const df = new DateFormatter("en-US", {
  dateStyle: "medium",
});

const range = shallowRef({
  start: today(tz).subtract({ months: 1 }),
  end: today(tz),
});

const exportUrl = computed(() => {
  if (!key.value) {
    return null;
  }

  const { start, end } = range.value;

  const params = new URLSearchParams({
    start: formatISO(startOfDay(start.toDate(tz))),
    end: formatISO(endOfDay(end.toDate(tz))),
    keyId: key.value.key_id,
  });

  return `/api/devices/${deviceId}/sensors/${sensorId}/csv?${params.toString()}`;
});
</script>

<template>
  <div class="flex flex-row gap-4">
    <UPopover>
      <UButton
        color="neutral"
        variant="subtle"
        icon="i-lucide-calendar"
        class="cursor-pointer"
      >
        <template v-if="range.start">
          <template v-if="range.end">
            {{ df.format(range.start.toDate(tz)) }} -
            {{ df.format(range.end.toDate(tz)) }}
          </template>

          <template v-else>
            {{ df.format(range.start.toDate(getLocalTimeZone())) }}
          </template>
        </template>
        <template v-else> Pick a date </template>
      </UButton>

      <template #content>
        <UCalendar v-model="range" class="p-2" :number-of-months="2" range />
      </template>
    </UPopover>

    <UButton
      :loading="!isDefined(exportUrl)"
      :disabled="!isDefined(exportUrl)"
      :to="exportUrl ?? ''"
      external
      icon="i-lucide-file-down"
      class="cursor-pointer"
      label="Export Readings"
      color="neutral"
      variant="subtle"
      size="lg"
    />
  </div>
</template>
