<script setup lang="ts">
import {
  $CreatableDeviceType,
  $NewDevice,
  type NewDevice,
} from "#shared/types";
import { formatError } from "#shared/utils";
import type { FormSubmitEvent, SelectItem } from "@nuxt/ui";

const emit = defineEmits<{
  deviceCreated: [];
}>();

const toast = useToast();
const open = ref(false);

const state = reactive<Partial<NewDevice>>({
  id: "",
  name: "",
  type: "air_quality",
  is_public: false,
});

async function onSubmit(event: FormSubmitEvent<NewDevice>) {
  try {
    await $fetch("/api/devices", {
      method: "POST",
      body: event.data,
    });
    toast.add({
      title: "Success",
      description: "Device has been created.",
      color: "success",
    });
    open.value = false;
    emit("deviceCreated");
  } catch (error) {
    toast.add({
      title: "Error",
      description: formatError(error),
      color: "error",
    });
  }
}

const deviceTypeSelections = ref<SelectItem[]>(
  $CreatableDeviceType.options.map((type) => ({
    value: type,
    label: formatDeviceType(type),
  })),
);
</script>

<template>
  <UModal
    v-model:open="open"
    title="Create Device"
    description="Register your Air Quality box or Zigbee device to the system."
  >
    <UButton
      class="cursor-pointer"
      label="New Device"
      color="neutral"
      variant="subtle"
    />

    <template #body>
      <UForm
        :schema="$NewDevice"
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
            :items="deviceTypeSelections"
            placeholder="Select Device Type"
            class="w-full"
          />
        </UFormField>

        <UFormField label="Latitude" name="latitude">
          <UInput v-model="state.latitude" class="w-full" />
        </UFormField>

        <UFormField label="Longitude" name="longitude">
          <UInput v-model="state.longitude" class="w-full" />
        </UFormField>

        <UButton class="justify-self-end mt-4" type="submit"> Submit </UButton>
      </UForm>
    </template>
  </UModal>
</template>

<style scoped></style>
