<script setup lang="ts">
import { Toaster } from '@/components/ui/sonner'
import 'vue-sonner/style.css'
</script>

<template>
	<NuxtLayout>
		<NuxtPage />
		<ClientOnly>
			<Toaster />
		</ClientOnly>
	</NuxtLayout>
</template>
