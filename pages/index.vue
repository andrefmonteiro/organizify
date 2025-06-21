<template>
  <div>
    <!-- Hero -->
    <div class="relative isolate">
      <!-- isolate: Creates a new stacking context (helps with z-index layering) -->

      <!-- Decorative background gradient -->
      <div
        class="absolute inset-x-0 -top-40 -z-10 transform-gpu overflow-hidden blur-3xl sm:-top-80"
        aria-hidden="true"
      >
        <div class="relative left-[calc(50%-11rem)] aspect-[1155/678] w-[36.125rem] -translate-x-1/2 rotate-[30deg] bg-gradient-to-tr from-primary/30 to-primary/10 sm:left-[calc(50%-30rem)] sm:w-[72.1875rem]" />
      </div>

      <!-- Hero Content -->
      <div class="mx-auto max-w-2xl py-20 sm:py-24 lg:py-56">
        <div class="text-center">
          <h1 class="text-4xl font-bold tracking-tight text-balance sm:text-6xl">
            <!--
                tracking-tight: Slightly tighter letter spacing (-0.025em) - makes large text look more refined
                text-balance: CSS property that balances line lengths for better readability
              -->
            Never lose your favorite tracks again
          </h1>

          <p class="mt-6 text-lg leading-8 text-muted-foreground">
            Annoyed by Discover Weekly and Release Radar disappearing every week?
            Organizify automatically saves these tracks to permanent playlists,
            so you never lose track of music you love.
          </p>

          <div class="mt-10 flex items-center justify-center gap-x-6">
            <Button
              size="lg"
              class="px-8"
            >
              Try it
            </Button>

            <a
              href="#how-it-works"
              class="text-sm font-semibold leading-6 text-foreground hover:text-primary transition-colors"
            >
              Learn more
              <span aria-hidden="true">→</span> <!-- TODO arrow icon here? -->
            </a>
          </div>
        </div>
      </div>
    </div>

    <!-- How it Works -->
    <div
      id="how-it-works"
      class="py-16 sm:py-20"
    >
      <!--
          TODO create components/HowItWorks.vue
          and replace this section with <HowItWorks />
        -->
      <div class="mx-auto max-w-7xl px-6 lg:px-8">
        <div class="mx-auto max-w-2xl text-center">
          <h2 class="text-3xl font-bold tracking-tight sm:text-4xl">
            How Organizify Works
          </h2>
        </div>

        <!-- Placeholder content -->
        <div class="mx-auto mt-16 max-w-2xl">
          <div class="text-center text-muted-foreground">
            <p>Step-by-step explanation coming soon...</p>
            <p class="mt-4">
              Will also show future features.
            </p>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
// Page metadata for SEO
useHead({
  title: 'Organizify - Never Lose Your Discover Weekly Tracks',
  meta: [
    {
      name: 'description',
      content: 'Automatically save your Spotify Discover Weekly and Release Radar tracks to permanent playlists. Never lose track of music you love again.',
    },
  ],
})
</script>
