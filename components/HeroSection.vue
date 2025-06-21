<template>
  <div class="relative isolate">
    <!-- isolate: Creates a new stacking context (helps with z-index layering) -->
    <div class="mx-auto max-w-2xl py-20 sm:py-24 lg:py-32">
      <div class="text-center">
        <h1 class="text-4xl font-bold tracking-tight text-balance sm:text-6xl">
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
            class="px-8 font-semibold"
          >
            Try it
          </Button>

          <Button
            size="lg"
            class="px-8 font-semibold"
            variant="link"
            as-child
          >
            <a href="#how-it-works">Learn more <span aria-hidden="true">→</span></a>
          </Button>
        </div>
      </div>
    </div>
  </div>
</template>
