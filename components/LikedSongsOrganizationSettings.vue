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
	}
	catch (error) {
		const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred'
		console.error('❌ Organization failed:', errorMessage)

		toast.error('❌ Failed to organize music', {
			description: 'Logout and try again.',
			duration: 8000,
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
