<!-- components/LikedSongsOrganizationSettings.vue -->
<script setup lang="ts">
import { toast } from 'vue-sonner'

const isOrganizing = ref<boolean>(false)
const isLoading = ref<boolean>(false)

const handleOrganizeToggle = async (enabled: boolean) => {
	if (!enabled) {
		isOrganizing.value = false
		isLoading.value = false
		return
	}

	console.log('🎵 Starting server-side genre organization...')

	isOrganizing.value = true
	isLoading.value = true

	try {
		const result = await $fetch('/api/spotify/organize-liked-songs', {
			method: 'POST',
		})

		if (result.success) {
			console.log('✅ Organization completed successfully!')

			if ('summary' in result) {
				const { summary, playlists } = result

				let description = `Processed ${summary.songsProcessed} songs from your library`
				if (playlists && playlists.length > 0) {
					description += '\n\nCreated playlists:\n'
						+ playlists.map(p => `🎼 ${p.genre} (${p.trackCount} songs)`).join('\n')
				}

				toast.success('🎉 Music organized successfully!', {
					style: {
						background: '#6ee7b7',
					},
					description,
					duration: 8000,
					action: {
						label: 'Dismiss',
						onClick: () => console.log('Toast dismissed'),
					},
				})
			}
			else {
				toast.success('🎉 Music organized successfully!', {
					description: `Created ${result.playlistsCreated || 0} playlists`,
					duration: 5000,
				})
			}

			isOrganizing.value = true
		}
		else {
			console.log('⚠️ Organization completed with issues:', result.message)

			toast.warning('⚠️ Organization completed with issues', {
				description: result.message,
				duration: 6000,
			})

			isOrganizing.value = false
		}
	}
	catch (error) {
		const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred'
		console.error('❌ Organization failed:', errorMessage)

		toast.error('❌ Failed to organize music', {
			description: 'Please try again or check your Spotify permissions.',
			duration: 6000,
			action: {
				label: 'Retry',
				onClick: () => handleOrganizeToggle(true),
			},
		})

		isOrganizing.value = false
	}
	finally {
		isLoading.value = false
	}
}
</script>

<template>
	<div class="w-full max-w-lg space-y-6">
		<div>
			<h2 class="mt-12 mb-4 text-lg font-medium">
				Liked Songs
			</h2>

			<div class="space-y-4">
				<FeatureToggleCard
					title="Organize by genre"
					description="Syncs your Liked Songs with genre-themed playlists"
					:loading="isLoading"
					@toggle="handleOrganizeToggle"
				/>

				<div
					v-if="isLoading"
					class="p-4 bg-surface-default rounded-lg border space-y-3"
				>
					<div class="flex items-center space-x-3">
						<div class="animate-spin h-4 w-4 border-2 border-text-primary border-t-transparent rounded-full" />
						<p class="text-sm text-text-primary font-medium">
							Organizing your music library...
						</p>
					</div>

					<!-- Helpful context for users -->
					<div class="text-xs text-text-secondary space-y-1">
						<p>🎵 Analyzing your liked songs and creating genre playlists</p>
					</div>
				</div>
			</div>
		</div>
	</div>
</template>
