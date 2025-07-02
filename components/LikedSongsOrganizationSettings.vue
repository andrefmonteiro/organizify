<!-- eslint-disable @typescript-eslint/no-explicit-any -->
<script setup lang="ts">
const { getUserLikedSongs } = useSpotifyApi()

const isOrganizing = ref<boolean>(false)
const isLoading = ref(false)
const handleOrganizeToggle = async (enabled: boolean) => {
	if (!enabled) {
		// Switch turned OFF
		isOrganizing.value = false
		console.log('🔄 Organization disabled')
		return
	}

	// Switch turned ON - start the API call
	console.log('🎵 Switch enabled - starting to fetch ALL liked songs...')
	isLoading.value = true

	try {
		const allLikedSongs = await getUserLikedSongs()

		console.log('📊 Complete Results:', allLikedSongs)
		console.log(`🎯 Successfully fetched ALL ${allLikedSongs.total} liked songs!`)

		if (allLikedSongs.items?.length > 0) {
			console.log('🔍 First 3 songs analysis:')
			allLikedSongs.items.slice(0, 3).forEach((item: any, index: number) => {
				const track = item.track
				const artist = track?.artists?.[0]

				console.log(`Song ${index + 1}:`, {
					name: track?.name,
					artist: artist?.name,
					artistId: artist?.id,
					album: track?.album?.name,
					addedAt: item.added_at,
					trackGenres: track?.genres || 'No track genres',
					artistGenres: artist?.genres || 'No artist genres',
				})
			})
		}

		isOrganizing.value = true
	}
	catch (error) {
		console.error('❌ Error fetching liked songs:', error)
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
					description="Creates genre-themed playlists of your Liked Songs"
					:enabled="isOrganizing"
					:loading="isLoading"
					@toggle="handleOrganizeToggle"
				/>
			</div>
		</div>
	</div>
</template>
