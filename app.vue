<script setup lang="ts">
import { TriangleAlert } from 'lucide-vue-next'
import { Toaster } from '@/components/ui/sonner'
import 'vue-sonner/style.css'
</script>

<template>
	<Alert
		variant="warning"
	>
		<TriangleAlert class="w-4 h-4" />
		<AlertTitle class="text-base font-bold">
			Under renovation
		</AlertTitle>
		<AlertDescription class="mt-2 text-base">
			We're moving some things around. No need to panic if you can't automate your Spotify organization for now.
		</AlertDescription>
	</Alert>
	<NuxtLayout>
		<NuxtPage />
		<ClientOnly>
			<Toaster />
		</ClientOnly>
	</NuxtLayout>
</template>
