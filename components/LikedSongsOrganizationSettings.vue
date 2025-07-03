<!-- eslint-disable @typescript-eslint/no-explicit-any -->
<script setup lang="ts">
const { organizeByGenre } = useGenreOrganization()
const { getUserLikedSongs } = useSpotifyApi()

const isOrganizing = ref<boolean>(false)
const isLoading = ref(false)

const handleOrganizeToggle = async (enabled: boolean) => {
	if (!enabled) {
		isOrganizing.value = false
		console.log('🔄 Organization disabled')
		return
	}

	console.log('🎵 Starting genre organization of your liked songs...')
	isLoading.value = true

	try {
		// Step 1: Get all liked songs (this replaces your getBatchLikedSongs call)
		console.log('📦 Fetching all your liked songs...')
		const allSongs = await getUserLikedSongs()
		console.log(`✅ Loaded ${allSongs.total} songs from your library`)

		// Step 2: Organize them by genre using our intelligent system
		console.log('🎭 Organizing songs by artist genres...')
		const startTime = Date.now()
		const organizedSongs = await organizeByGenre(allSongs.items)
		const processingTime = ((Date.now() - startTime) / 1000).toFixed(1)

		// Step 3: Log the beautiful results
		console.log('\n🎊 GENRE ORGANIZATION COMPLETE!')
		console.log('='.repeat(50))
		console.log(`⚡ Organized ${allSongs.total} songs in ${processingTime} seconds`)
		console.log('')

		// Sort by playlist size for better readability
		const genreEntries = Object.entries(organizedSongs)
			.sort(([, songsA], [, songsB]) => songsB.length - songsA.length)

		console.log(`🎼 Your music organized into ${genreEntries.length} playlists:`)
		console.log('')

		// Show each playlist with sample songs
		genreEntries.forEach(([genre, songs]) => {
			const percentage = ((songs.length / allSongs.total) * 100).toFixed(1)
			console.log(`📁 ${genre.toUpperCase()} PLAYLIST - ${songs.length} songs (${percentage}%)`)

			// Show first few songs as examples
			songs.slice(0, 3).forEach((item: any, index: number) => {
				const track = item.track
				const artist = track?.artists?.[0]
				console.log(`   ${index + 1}. "${track?.name}" by ${artist?.name}`)
			})

			if (songs.length > 3) {
				console.log(`   ... and ${songs.length - 3} more songs`)
			}
			console.log('') // Empty line for readability
		})

		console.log('🚀 Ready for playlist creation!')
		isOrganizing.value = true
	}
	catch (error) {
		console.error('❌ Genre organization failed:', error)
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
