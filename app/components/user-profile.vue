<script setup lang="ts">
import type { DropdownMenuItem } from "@nuxt/ui";

const route = useRoute();
const auth = useAuth();
const { user } = useUser();

const fullName = computed(() => user.value?.fullName ?? "Unknown");

const email = computed(
  () => user.value?.primaryEmailAddress?.emailAddress ?? "NA",
);

const items = computed<DropdownMenuItem[][]>(() => [
  [
    {
      label: fullName.value,
      icon: "i-lucide-user",
      type: "label",
    },
    {
      label: email.value,
      icon: "i-lucide-mail",
      class: "text-xs font-normal",
      type: "label",
    },
  ],
  [
    {
      label: "Logout",
      icon: "i-lucide-log-out",
      class: "text-red-500 cursor-pointer",
      onSelect: logout,
      type: "link",
    },
  ],
]);

async function logout() {
  const signOut = auth.signOut.value;

  clearNuxtData();
  if (route.path === "/devices") {
    await signOut();
    window.location.reload();
  } else {
    await signOut({ redirectUrl: "/" });
  }
}
</script>

<template>
  <UAvatar v-if="!isDefined(user)" />
  <UDropdownMenu
    v-else
    :items="items"
    :ui="{
      content: 'w-52',
    }"
  >
    <UAvatar
      class="cursor-pointer outline-2 outline-offset-4 outline-dashed outline-default"
      :src="user.imageUrl"
      :alt="fullName"
      size="sm"
    />
  </UDropdownMenu>
</template>

<style scoped></style>
