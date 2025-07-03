<!-- eslint-disable @typescript-eslint/no-explicit-any -->
<script setup lang="ts">
const isOrganizing = ref<boolean>(false)
const isLoading = ref(false)

const handleOrganizeToggle = async (enabled: boolean) => {
	if (!enabled) {
		isOrganizing.value = false
		console.log('🔄 Organization disabled')
		return
	}

	// Switch turned ON - start the API call
	console.log('🎵 Switch enabled - starting to fetch ALL liked songs...')
	isLoading.value = true

	try {
		const { getBatchLikedSongs } = useSpotifyApi()

		// ✅ PROPERLY AWAITED: Now we wait for the API call to complete
		// before logging the results
		const songs = await getBatchLikedSongs(10, 0)

		console.log('📦 Batch of songs received:', songs)
		console.log('🎵 Number of songs:', songs?.items?.length)
		console.log('📊 Total available:', songs?.total)

		// Let's also examine the first song to see the data structure
		if (songs?.items?.[0]) {
			const firstSong = songs.items[0]
			console.log('🎼 First song analysis:', {
				songName: firstSong.track?.name,
				artistName: firstSong.track?.artists?.[0]?.name,
				albumName: firstSong.track?.album?.name,
				addedDate: firstSong.added_at,
				trackId: firstSong.track?.id,
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
