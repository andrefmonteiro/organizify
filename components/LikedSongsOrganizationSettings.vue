<!-- eslint-disable @typescript-eslint/no-explicit-any -->
<script setup lang="ts">
import { toast } from 'vue-sonner'

// Loading state for better UX
const isLoading = ref(false)

const syncLikedSongs = async () => {
	console.log('🎵 Sync button clicked')
	isLoading.value = true

	try {
		const result = await $fetch('/api/spotify/organize-liked-songs', {
			method: 'POST',
		})

		// Handle the new structured response
		if (result.success) {
			// Show success toast with detailed information
			if (result.newSongsProcessed === 0) {
				// No new songs case
				toast.success('🎉 Music already organized!', {
					style: {
						background: '#6ee7b7',
					},
					description: result.message,
					duration: 6000,
					action: {
						label: 'Dismiss',
					},
				})
			}
			else {
				toast.success('🎉 Successfully organized your music!', {
					style: {
						background: '#6ee7b7',
					},
					description: result.message, // Just use the endpoint's message
					duration: 8000,
					action: {
						label: 'Dismiss',
					},
				})
			}
		}
		else {
			// Handle case where success is false
			throw new Error(result.message || 'Organization failed')
		}
	}
	catch (error: any) {
		console.error('❌ Organization failed:', error)

		// Show more specific error messages based on error codes
		let errorTitle = '❌ Failed to organize music'
		let errorDescription = 'Please try again later.'
		let showReconnectAction = false

		if (error.data?.code === 'authentication_required' || error.status === 401) {
			errorTitle = '🔒 Spotify connection lost'
			errorDescription = 'Your Spotify permissions have been revoked or expired. Please reconnect your account.'
			showReconnectAction = true
		}
		else if (error.data?.code === 'organization_failed') {
			errorDescription = error.data?.message || 'Something went wrong during organization.'
		}

		toast.error(errorTitle, {
			description: errorDescription,
			duration: 8000,
			action: showReconnectAction
				? {
						label: 'Reconnect Spotify',
						onClick: async () => {
							const { signInWithSpotify } = useAuthActions()
							await signInWithSpotify()
						},
					}
				: {
						label: 'Retry',
						onClick: () => syncLikedSongs(),
					},
		})
	}
	finally {
		isLoading.value = false
		console.log('🏁 Sync process completed')
	}
}
</script>

<template>
	<div class="max-w-xl space-y-6">
		<h2 class="mt-12 mb-6 text-xl font-medium">
			Liked Songs Organization
		</h2>

		<FeatureCard
			title="Organize by genre"
			description="Sync your Liked Songs with genre-themed playlists"
		>
			<Button
				class="cursor-pointer"
				:disabled="isLoading"
				@click="syncLikedSongs"
			>
				<span
					v-if="isLoading"
					class="flex items-center gap-2"
				>
					<div class="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
					Organizing...
				</span>
				<span v-else>Organize songs</span>
			</Button>
		</FeatureCard>
	</div>
</template>
