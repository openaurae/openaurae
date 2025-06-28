<script setup lang="ts">
import { tv } from "tailwind-variants";

const variants = tv({
  slots: {
    wrapper: "w-full",
    name: "text-xs text-muted uppercase",
    value: "text-sm font-semibold text-highlighted",
  },
  variants: {
    orientation: {
      vertical: {
        wrapper: "flex flex-col gap-1 w-full",
      },
      horizontal: {
        wrapper: "flex justify-between",
      },
    },
  },
  defaultVariants: {
    orientation: "vertical",
  },
});

const { orientation = "vertical" } = defineProps<{
  orientation?: "vertical" | "horizontal";
}>();

const { name, value, wrapper } = variants({ orientation });
</script>
<template>
  <div :class="wrapper()">
    <div :class="name()">
      <slot name="label" />
    </div>
    <div :class="value()">
      <slot name="value" />
    </div>
  </div>
</template>
<style scoped></style>
