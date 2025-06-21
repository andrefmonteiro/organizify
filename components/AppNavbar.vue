<template>
  <header class="absolute inset-x-0 top-0 z-50 bg-muted">
    <nav class="flex items-center justify-between px-6 py-4 lg:px-8">
      <div class="flex items-center">
        <NuxtLink
          to="/"
        >
          <h1 class="text-2xl font-bold hover:opacity-80 transition-opacity">
            Organizify
          </h1>
        </NuxtLink>
      </div>

      <div class="flex items-center">
        <Button>Login</Button>
      </div>
    </nav>
  </header>
</template>
