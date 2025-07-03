<!-- eslint-disable @typescript-eslint/no-explicit-any -->
<script setup lang="ts">
const { organizeByGenre } = useGenreOrganization()
const { getUserLikedSongs } = useSpotifyApi()

const isOrganizing = ref<boolean>(false)
const isLoading = ref(false)

const handleOrganizeToggle = async (enabled: boolean) => {
	if (!enabled) {
		isOrganizing.value = false
		return
	}

	console.log('🎵 Starting genre organization of your liked songs...')
	isLoading.value = true

	try {
		// Step 1: Get all liked songs
		const allSongs = await getUserLikedSongs()
		console.log(`📦 Loaded ${allSongs.total} songs from your library`)

		// Step 2: Organize them by genre
		const organizedSongs = await organizeByGenre(allSongs.items)

		// Step 3: Filter out empty genres and prepare for playlist creation
		const genreEntries = Object.entries(organizedSongs)
			.filter(([_genre, songs]) => songs.length > 0)
			.sort(([, songsA], [, songsB]) => songsB.length - songsA.length)

		if (genreEntries.length === 0) {
			console.log('❌ No songs to organize - all genres were empty')
			return
		}

		console.log(`🎼 Creating ${genreEntries.length} playlists...`)

		let playlistsCreated = 0
		let totalTracks = 0

		// Process each genre sequentially to avoid overwhelming the API
		for (const [genre, songs] of genreEntries) {
			try {
				console.log(`📁 Creating "${genre}" playlist (${playlistsCreated + 1}/${genreEntries.length})...`)

				// Step 1: Create the playlist container
				const playlistResponse = await $fetch('/api/spotify/create-playlist', {
					method: 'POST',
					body: { genreName: genre },
				}) as { playlistId: string, name: string, description: string, externalUrl: string, trackCount: number, public: boolean }
				console.log('Playlist response structure:', Object.keys(playlistResponse))
				console.log('Full response:', playlistResponse)

				// Step 2: Extract track IDs for the API call
				const trackIds = songs.map((item: any) => {
					const track = item.track || item
					return track.id
				}).filter(Boolean) // Remove any undefined track IDs

				// Step 3: Add tracks to the newly created playlist
				const addTracksResponse = await $fetch('/api/spotify/add-tracks-to-playlist', {
					method: 'POST',
					body: {
						playlist_id: playlistResponse.playlistId,
						track_ids: trackIds,
					},
				})

				if (addTracksResponse.success) {
					playlistsCreated++
					totalTracks += addTracksResponse.tracks_added
				}
			}
			catch (error) {
				// Continue with remaining genres even if this one fails
				console.error(`❌ Failed to create "${genre}" playlist:`, error)
			}
		}

		console.log(`🎊 Created ${playlistsCreated} playlists with ${totalTracks} total tracks`)
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
