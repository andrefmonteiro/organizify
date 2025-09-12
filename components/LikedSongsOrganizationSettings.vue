<!-- eslint-disable @typescript-eslint/no-explicit-any -->

<script setup lang="ts">
import { toast } from 'vue-sonner'

const isLoading = ref(false)

const formatGenreList = (genres: string[]): string => {
	if (genres.length === 0) return ''
	if (genres.length === 1) return genres[0]!
	if (genres.length === 2) return `${genres[0]} and ${genres[1]}`
	return `${genres.slice(0, -1).join(', ')}, and ${genres[genres.length - 1]}`
}

const syncLikedSongs = async () => {
	isLoading.value = true

	try {
		const result = await $fetch('/api/spotify/organize-liked-songs', {
			method: 'POST',
		})

		if (result.success) {
			if (result.totalSongsAdded === 0) {
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
				const parts: string[] = []

				const createdGenres = (result as any).createdGenres || []
				if (createdGenres.length > 0) {
					const createdList = formatGenreList(createdGenres)
					parts.push(`Created: ${createdList}`)
				}

				const updatedGenres = (result as any).updatedGenres || []
				if (updatedGenres.length > 0) {
					const updatedList = formatGenreList(updatedGenres)
					parts.push(`Updated: ${updatedList}`)
				}

				const description = (result as any).genreBreakdown && (result as any).genreBreakdown.length > 0
					? (result as any).genreBreakdown
							.map(({ genre, count }: { genre: string, count: number }) => `• ${count} ${genre} song${count === 1 ? '' : 's'}`)
							.join('\n')
					: `Organized ${result.newSongsProcessed} new songs`

				toast.success('🎉 Successfully organized your music!', {
					style: {
						background: '#6ee7b7',
					},
					description,
					duration: 8000,
					action: {
						label: 'Dismiss',
					},
				})
			}
		}
		else {
			throw new Error(result.message || 'Organization failed')
		}
	}
	catch (error: any) {
		console.error('❌ Organization failed:', error)

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
	}
}
</script>

<template>
	<div class="w-full max-w-xl space-y-6">
		<div>
			<h2 class="mt-12 mb-4 text-xl font-medium">
				Liked Songs
			</h2>

			<FeatureCard
				title="Organize by genre"
				description="Sync your Liked Songs with genre-themed playlists"
			>
				<Button
					class="cursor-pointer ml-12"
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
	</div>
</template>
