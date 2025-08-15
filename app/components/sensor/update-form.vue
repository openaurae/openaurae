<script setup lang="ts">
import type { Sensor, UpdateSensor } from "#shared/types";
import { formatError } from "#shared/utils";
import type { FormSubmitEvent } from "@nuxt/ui";

const props = defineProps<{
  sensor: Sensor;
}>();

const sensor = toRef(() => props.sensor);

const emit = defineEmits<{
  sensorUpdated: [];
}>();

const toast = useToast();
const open = ref(false);

const state = computed(() => ({
  name: sensor.value.name,
}));

async function onSubmit(event: FormSubmitEvent<UpdateSensor>) {
  try {
    await $fetch(
      `/api/devices/${sensor.value.device_id}/sensors/${sensor.value.id}`,
      {
        method: "PUT",
        body: event.data,
      },
    );
    toast.add({
      title: "Success",
      description: "Sensor has been updated.",
      color: "success",
    });
    open.value = false;
    emit("sensorUpdated");
  } catch (error) {
    toast.add({
      title: "Error",
      description: formatError(error),
      color: "error",
    });
  }
}
</script>

<template>
  <UModal v-model:open="open" title="Edit Sensor Information">
    <UButton
      icon="material-symbols:edit-square-outline"
      class="cursor-pointer"
      label="Edit"
      color="neutral"
      variant="subtle"
      size="xs"
    />

    <template #body>
      <UForm
        :schema="$UpdateSensor"
        :state="state"
        class="w-full grid gap-6"
        @submit="onSubmit"
      >
        <UFormField label="ID" name="id" required>
          <UInput v-model="sensor.id" disabled class="w-full" />
        </UFormField>

        <UFormField label="Name" name="name" required>
          <UInput v-model="state.name" class="w-full" />
        </UFormField>

        <UFormField label="Type" name="type" required>
          <UInput
            :model-value="formatSensorType(sensor.type)"
            disabled
            class="w-full"
          />
        </UFormField>

        <UButton class="justify-self-end mt-4 cursor-pointer" type="submit">
          Submit
        </UButton>
      </UForm>
    </template>
  </UModal>
</template>

<style scoped></style>
