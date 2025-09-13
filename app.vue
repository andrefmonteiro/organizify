<script setup lang="ts">
import { Toaster } from '@/components/ui/sonner'
import 'vue-sonner/style.css'

const isOnAnnouncement = computed(() => useRoute().path == '/announcement')
</script>

<template>
	<div
		v-if="!isOnAnnouncement"
		class="bg-surface-green min-h-10 flex justify-center items-center"
	>
		<p class="ml-6 text-sm text-primary py-3">
			Due to Spotify's restrictions, Organizify is <span class="font-semibold">
				invite-only:
			</span> <NuxtLink
				to="/announcement"
				class="underline underline-offset-4"
			>read why.</NuxtLink>
		</p>
	</div>
	<NuxtLayout>
		<NuxtPage />
		<ClientOnly>
			<Toaster />
		</ClientOnly>
	</NuxtLayout>
</template>
