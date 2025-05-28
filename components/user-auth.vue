<script setup lang="ts">
const { signOut } = useAuth();
const { user } = useUser();

const email = computed(
  () => user.value?.emailAddresses?.at(0)?.emailAddress ?? "NA",
);
const imageUrl = computed(() => user.value?.imageUrl);

async function signOutAndClearCache() {
  clearNuxtData();
  await signOut.value({ redirectUrl: "/" });
}
</script>

<template>
  <SignedOut>
    <SignInButton>
      <UButton size="md" class="cursor-pointer" color="primary" variant="soft"
        >Sign In</UButton
      >
    </SignInButton>
  </SignedOut>
  <SignedIn>
    <UTooltip :delay-duration="0" :text="email" class="text-xl">
      <UAvatar :src="imageUrl" :alt="email" />
    </UTooltip>
    <UButton
      size="md"
      class="cursor-pointer"
      color="error"
      variant="soft"
      @click="signOutAndClearCache"
      >Sign Out</UButton
    >
  </SignedIn>
</template>

<style></style>
