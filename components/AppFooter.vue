<script setup lang="ts">
const currYear = new Date().getFullYear()
</script>

<template>
  <footer class="mt-16 border-t border-border bg-muted/5 lg:col-span-3">
    <div class="mx-auto max-w-7xl px-6 py-8 lg:px-8">
      <div class="text-center text-sm text-muted-foreground">
        <p>&copy; {{ currYear }} Organizify</p>
      </div>
    </div>
  </footer>
</template>
