<template>
  <div class="min-h-screen bg-background text-foreground">
    <AppNavbar />
    <main class="relative">
      <div class="px-6 pt-16 lg:px-8">
        <slot />
      </div>
    </main>
    <AppFooter />
  </div>
</template>
