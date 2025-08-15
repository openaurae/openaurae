<script setup lang="ts">
import { $UpdateDevice } from "#shared/schema";
import type { Device, UpdateDevice } from "#shared/types";
import { formatError } from "#shared/utils";
import type { FormSubmitEvent } from "@nuxt/ui";

const props = defineProps<{
  device: Device;
}>();

const device = toRef(() => props.device);

const emit = defineEmits<{
  deviceUpdated: [];
}>();

const toast = useToast();
const open = ref(false);

const state = computed(() => $UpdateDevice.parse(device.value));

async function onSubmit(event: FormSubmitEvent<UpdateDevice>) {
  try {
    await $fetch(`/api/devices/${device.value.id}`, {
      method: "PUT",
      body: event.data,
    });
    toast.add({
      title: "Success",
      description: "Device has been updated.",
      color: "success",
    });
    open.value = false;
    emit("deviceUpdated");
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
  <UModal v-model:open="open" title="Edit Device Information">
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
        :schema="$UpdateDevice"
        :state="state"
        class="w-full grid gap-6"
        @submit="onSubmit"
      >
        <UFormField label="ID" name="id" required>
          <UInput v-model="device.id" disabled class="w-full" />
        </UFormField>

        <UFormField label="Name" name="name" required>
          <UInput v-model="state.name" class="w-full" />
        </UFormField>

        <UFormField label="Type" name="type" required>
          <UInput
            :model-value="formatDeviceType(device.type)"
            disabled
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
