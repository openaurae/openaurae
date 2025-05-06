<script setup lang="ts"></script>

<template>
  <div class="w-full h-full bg-slate-100">
    <header
      class="bg-slate-100/75 backdrop-blur border-b border-slate-200 h-14 sticky top-0 z-50"
    >
      <div
        class="w-full max-w-[90rem] mx-auto px-4 sm:px-6 lg:px-8 flex items-center justify-between gap-3 h-full"
      >
        <ULink to="/" class="text-black">
          <div class="flex gap-2 justify-center items-center">
            <AppLogo class="size-10 fill-slate-700 stroke-slate-700" />
            <span class="font-semibold text-slate-700 text-xl">OpenAurae</span>
          </div>
        </ULink>

        <div>
          <SignedOut>
            <SignInButton>
              <UButton
                size="md"
                class="cursor-pointer"
                color="secondary"
                variant="soft"
                >Sign In</UButton
              >
            </SignInButton>
          </SignedOut>
          <SignedIn>
            <UserButton />
          </SignedIn>
        </div>
      </div>
    </header>
    <main>
      <slot />
    </main>
  </div>
</template>

<style scoped></style>
