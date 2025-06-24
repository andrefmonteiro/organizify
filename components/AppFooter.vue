<script setup lang="ts">
const currYear = new Date().getFullYear()
</script>

<template>
  <footer class="mt-16 border-t border-border bg-muted/5 lg:col-span-3">
    <div class="px-6 py-4 mx-auto max-w-7xl lg:px-8">
      <div class="text-sm text-center text-muted-foreground">
        <p>&copy; {{ currYear }} Organizify</p>
      </div>
    </div>
  </footer>
</template>
