<template>
  <div class="min-h-screen bg-background text-foreground">
    <header class="absolute inset-x-0 top-0 z-50">
      <!-- AppNavbar component will go here -->
      <nav class="flex items-center justify-between px-6 py-4 lg:px-8">
        <!-- Logo/ -->
        <div class="flex items-center">
          <h1 class="text-2xl font-bold">
            Organizify
          </h1>
        </div>

        <!-- Navigation Links (Desktop) -->
        <div class="hidden lg:flex lg:items-center lg:gap-x-8">
          <!--
              hidden: Sets display: none (hidden by default on mobile)
             the hidden class only applies to mobile? and on desktop this class isn't applied?
            -->

          <a
            href="#how-it-works"
            class="text-sm font-medium hover:text-primary transition-colors"
          >
            <!--
                transition-colors: Smoothly animates color changes (0.15s duration by default)
              -->
            How it Works
          </a>
        </div>

        <!-- Auth Section -->
        <div class="flex items-center">
          <button class="rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90 transition-colors">
            Login with Spotify
          </button>
        </div>
      </nav>
    </header>

    <!-- Main Content Area -->
    <main class="relative">
      <div class="px-6 pt-16 lg:px-8">
        <slot />
      </div>
    </main>

    <footer class="mt-16 border-t border-border bg-muted/5">
      <div class="mx-auto max-w-7xl px-6 py-8 lg:px-8">
        <div class="text-center text-sm text-muted-foreground">
          <p>&copy; {{ currYear }} Organizify. Never lose your favorite tracks again.</p>
        </div>
      </div>
    </footer>
  </div>
</template>

<script setup lang="ts">
const currYear = ref(new Date().getFullYear())
</script>
