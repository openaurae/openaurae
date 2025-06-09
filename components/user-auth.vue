<script setup lang="ts">
const auth = useAuth();
const { user } = useUser();
const route = useRoute();

const email = computed(
  () => user.value?.primaryEmailAddress?.emailAddress ?? "NA",
);
const imageUrl = computed(() => user.value?.imageUrl);

async function signOutAndClearCache() {
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
  <SignedOut>
    <SignInButton>
      <UButton size="md" class="cursor-pointer" color="primary" variant="soft">
        Sign In
      </UButton>
    </SignInButton>
  </SignedOut>
  <SignedIn>
    <UTooltip :delay-duration="0" :text="email" class="text-xl">
      <UAvatar :src="imageUrl" :alt="email" />
    </UTooltip>
    <UButton
      size="xs"
      class="cursor-pointer"
      color="error"
      variant="soft"
      @click="signOutAndClearCache"
    >
      Sign Out
    </UButton>
  </SignedIn>
</template>

<style></style>
