<script setup lang="ts"></script>

<template>
  <div class="w-full min-h-screen flex flex-col">
    <header
      class="h-14 sticky top-0 z-50 backdrop-blur border-b border-(--ui-border) bg-(--ui-bg)/75"
    >
      <UContainer class="flex justify-between items-center h-full">
        <ULink to="/">
          <div class="flex gap-2 justify-center items-center">
            <AppLogo class="size-10 fill-slate-700 stroke-slate-700" />
            <span class="font-semibold text-slate-700 text-xl">OpenAurae</span>
          </div>
        </ULink>

        <div class="flex gap-4 items-center">
          <UserAuth />
        </div>
      </UContainer>
    </header>

    <slot />

    <footer class="h-48 border-t border-(--ui-border)">
      <UContainer class="grid h-full place-content-center text-center gap-6">
        <p class="text-sm">openaurae.org@gmail.com</p>
        <div class="text-sm">
          <p>Building 60, 23 Colledge Walk, Clayton Campus</p>
          <p>Monash University, VIC 3800, Australia</p>
        </div>

        <p class="text-xs">Copyright © 2025 openaurae.org</p>
      </UContainer>
    </footer>
  </div>
</template>

<style scoped></style>
