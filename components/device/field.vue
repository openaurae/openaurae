<script setup lang="ts"></script>
<template>
  <div class="flex flex-col gap-1">
    <div class="text-xs text-gray-500 uppercase">
      <slot name="name" />
    </div>
    <div class="text-sm font-semibold text-gray-800">
      <slot name="value" />
    </div>
  </div>
</template>
<style scoped></style>
