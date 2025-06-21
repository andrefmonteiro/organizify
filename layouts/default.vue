<template>
  <div class="min-h-screen bg-background text-foreground grid grid-rows-[1fr_auto] grid-cols-[1fr_minmax(0,4fr)_1fr] gap-x-4 px-6 lg:grid-cols-[1fr_minmax(0,6fr)_1fr] lg:gap-x-6 lg:px-8">
    <AppNavbar />

    <main class="col-start-2 pt-16">
      <slot />
    </main>

    <footer class="col-span-3">
      <AppFooter />
    </footer>
  </div>
</template>
