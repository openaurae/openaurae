<script setup lang="ts">
import { formatError } from "#shared/utils";

const { deviceId, sensorId } = defineProps<{
  deviceId: string;
  sensorId: string;
}>();

const emit = defineEmits<{
  sensorDeleted: [deviceId: string, sensorId: string];
}>();

const toast = useToast();
const open = ref(false);

async function onConfirm() {
  try {
    await $fetch(`/api/devices/${deviceId}/sensors/${sensorId}`, {
      method: "DELETE",
    });
    toast.add({
      title: "Success",
      description:
        "Sensor has been unpaired and related records have been deleted.",
      color: "success",
    });
    closeModal();
    emit("sensorDeleted", deviceId, sensorId);
  } catch (error) {
    toast.add({
      title: "Error",
      description: formatError(error),
      color: "error",
    });
  }
}

function closeModal() {
  open.value = false;
}
</script>

<template>
  <UModal
    v-model:open="open"
    title="Unpair Sensor"
    description="Unpair sensor and remove from the system."
  >
    <UButton
      icon="material-symbols:delete-outline"
      class="cursor-pointer"
      label="Unpair"
      color="error"
      variant="subtle"
      size="xs"
    />

    <template #body>
      <div class="grid gap-4">
        <p>
          Are you sure you want to delete sensor <b>{{ sensorId }}</b
          >?
        </p>

        <p>This action will perform the following operations:</p>

        <ul class="list-disc list-inside grid gap-1">
          <li>Remove the sensor from the device's Zigbee network.</li>
          <li>Delete all associated sensor readings from the database.</li>
          <li>Remove the sensor record from the database.</li>
        </ul>
      </div>
    </template>

    <template #footer>
      <div class="w-full flex items-center justify-end gap-4">
        <UButton
          variant="subtle"
          color="info"
          class="justify-self-end mt-4 cursor-pointer"
          @click="closeModal"
        >
          Cancel
        </UButton>
        <UButton
          variant="subtle"
          color="error"
          class="justify-self-end mt-4 cursor-pointer"
          @click="onConfirm"
        >
          Confirm
        </UButton>
      </div>
    </template>
  </UModal>
</template>

<style scoped></style>
