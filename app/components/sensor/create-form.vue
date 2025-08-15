<script setup lang="ts">
import { $ZigbeeSensorType } from "#shared/schema";
import { type NewSensor } from "#shared/types";
import { formatError } from "#shared/utils";
import type { FormSubmitEvent, SelectItem } from "@nuxt/ui";

const { deviceId } = defineProps<{
  deviceId: string;
}>();

const emit = defineEmits<{
  sensorCreated: [];
}>();

const toast = useToast();
const open = ref(false);

const state = reactive<Partial<NewSensor>>({
  id: "",
  name: "",
  type: "zigbee_temp",
});

async function onSubmit(event: FormSubmitEvent<NewSensor>) {
  try {
    await $fetch(`/api/devices/${deviceId}/sensors`, {
      method: "POST",
      body: event.data,
    });
    toast.add({
      title: "Success",
      description: "Sensor has been created.",
      color: "success",
    });
    open.value = false;
    emit("sensorCreated");
  } catch (error) {
    toast.add({
      title: "Error",
      description: formatError(error),
      color: "error",
    });
  }
}

const sensorTypeSelections = ref(
  $ZigbeeSensorType.options.map((type) => ({
    value: type,
    label: formatSensorType(type),
  })) satisfies SelectItem[],
);
</script>

<template>
  <UModal
    v-model:open="open"
    title="Pair New Sensor"
    description="Pair a new Zigbee sensor and register to the system."
  >
    <UButton
      class="cursor-pointer"
      label="Pair Sensor"
      color="primary"
      variant="subtle"
    />

    <template #body>
      <UForm
        :schema="$NewSensor"
        :state="state"
        class="w-full grid gap-6"
        @submit="onSubmit"
      >
        <UFormField label="ID" name="id" required>
          <UInput v-model="state.id" class="w-full" />
        </UFormField>

        <UFormField label="Name" name="name" required>
          <UInput v-model="state.name" class="w-full" />
        </UFormField>

        <UFormField label="Type" name="type" required>
          <USelect
            v-model="state.type"
            :items="sensorTypeSelections"
            placeholder="Select Device Type"
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
