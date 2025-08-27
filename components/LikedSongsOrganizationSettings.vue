<!-- components/LikedSongsOrganizationSettings.vue -->
<script setup lang="ts">
import { toast } from 'vue-sonner'

const syncLikedSongs = async () => {
	console.log('🎵 Sync button clicked')

	try {
		const result = await $fetch('/api/spotify/organize-liked-songs', {
			method: 'POST',
		},
		)
		const organizedGenres: string[] = []

		for (const [genre] of Object.entries(result)) {
			organizedGenres.push(genre)
		}
		let genresStr: string = ''
		if (organizedGenres.length === 2) {
			genresStr = organizedGenres.join(' and ')
		}
		else {
			genresStr = organizedGenres.slice(0, -1).join(', ') + ', and ' + organizedGenres.slice(-1)
		}

		toast.success('🎉 You\'ve organized your liked songs!', {
			style: {
				background: '#6ee7b7',
			},
			description: `Added songs for the following genres: ${genresStr} `,
			duration: 8000,
			action: {
				label: 'Dismiss',
			},
		})
		/*
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
		}
		else {
			console.log('⚠️ Organization completed with issues:', result.message)

			toast.warning('⚠️ Organization completed with issues', {
				description: result.message,
				duration: 6000,
			})
		}
		*/
	}
	catch (error) {
		const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred'
		console.error('❌ Organization failed:', errorMessage)

		toast.error('❌ Failed to organize music', {
			description: 'Please try again or check your Spotify permissions.',
			duration: 6000,
			action: {
				label: 'Retry',
				onClick: () => syncLikedSongs(),
			},
		})
	}
	finally {
		console.log('\nSync ended')
	}
}
</script>

<template>
	<div class="w-full max-w-lg space-y-6">
		<div>
			<h2 class="mt-12 mb-4 text-lg font-medium">
				Liked Songs
			</h2>

			<FeatureCard
				title="Organize by genre"
				description="Sync your Liked Songs with genre-themed playlists"
			>
				<Button
					class="cursor-pointer"
					@click="syncLikedSongs"
				>
					Sync songs
				</Button>
			</FeatureCard>
		</div>
	</div>
</template>
