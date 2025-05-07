<script setup lang="ts"></script>

<template>
  <SignedOut>
    <SignInButton>
      <UButton size="md" class="cursor-pointer" color="secondary" variant="soft"
        >Sign In</UButton
      >
    </SignInButton>
  </SignedOut>
  <SignedIn>
    <UserButton />
  </SignedIn>
</template>

<style></style>
