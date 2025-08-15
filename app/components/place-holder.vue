<script setup lang="ts">
const { isLoading, text } = defineProps<{
  isLoading?: boolean;
  text: string;
}>();
</script>

<template>
  <div
    class="w-full min-h-[30vh] grow bg-muted rounded-xl grid items-center justify-center"
  >
    <USkeleton v-if="isLoading" class="w-full h-full" />
    <p v-else class="text-muted">{{ text }}</p>
  </div>
</template>

<style scoped></style>
