/* eslint-disable @typescript-eslint/no-explicit-any */

import { serverSupabaseSession } from '#supabase/server'

interface PlaylistResponse {
	playlistId: string
	name: string
	description: string
	externalUrl: string
	trackCount: number
	public: boolean
}

interface AddTracksResponse {
	success: boolean
	tracks_added: number
	tracks_requested: number
	playlist_id: string
}

export default defineEventHandler(async (_event) => {
	try {
		const session = await serverSupabaseSession(_event)
		if (!session?.provider_token) {
			throw createError({
				statusCode: 400,
				statusMessage: 'No provider tokens available',
				data: {
					code: 'no_provider_tokens',
					message: 'Provider tokens not available server-side',
				},
			})
		}

		console.log('🎵 Starting genre organization on server...')

		const { getUserLikedSongs } = useSpotifyApi()
		const allSongs = await getUserLikedSongs()
		console.log(`📦 Loaded ${allSongs.total} songs from user's library`)

		const { organizeByGenre } = useGenreOrganization()
		const organizedSongs = await organizeByGenre(allSongs.items)

		const genreEntries = Object.entries(organizedSongs)
			.filter(([_genre, songs]) => songs.length > 0)
			.sort(([, songsA], [, songsB]) => songsB.length - songsA.length)

		if (genreEntries.length === 0) {
			return {
				success: false,
				message: 'No songs found to organize - all genres were empty',
				playlistsCreated: 0,
				totalTracks: 0,
			}
		}

		console.log(`🎼 Ready to create ${genreEntries.length} playlists...`)

		let playlistsCreated = 0
		let totalTracks = 0
		const createdPlaylists = []

		for (const [genre, songs] of genreEntries) {
			try {
				console.log(`📁 Creating "${genre}" playlist (${playlistsCreated + 1}/${genreEntries.length})...`)

				const playlistResponse = await $fetch('/api/spotify/create-playlist', {
					method: 'POST',
					body: { genreName: genre },
				}) as PlaylistResponse

				const trackIds = songs.map((item: any) => {
					const track = item.track || item
					return track.id
				}).filter(Boolean) // Remove any undefined track IDs

				const addTracksResponse = await $fetch('/api/spotify/add-tracks-to-playlist', {
					method: 'POST',
					body: {
						playlist_id: playlistResponse.playlistId,
						track_ids: trackIds,
					},
				}) as AddTracksResponse

				if (addTracksResponse.success) {
					playlistsCreated++
					totalTracks += addTracksResponse.tracks_added

					createdPlaylists.push({
						genre: genre,
						playlistId: playlistResponse.playlistId,
						playlistName: playlistResponse.name,
						trackCount: addTracksResponse.tracks_added,
					})

					console.log(`✅ Created "${genre}" playlist with ${addTracksResponse.tracks_added} songs`)
				}
			}
			catch (error) {
				const errorMessage = error instanceof Error ? error.message : 'Unknown error'
				console.error(`❌ Failed to create "${genre}" playlist:`, errorMessage)
			}
		}

		const finalResult = {
			success: true,
			message: `Successfully organized your music! Created ${playlistsCreated} playlists with ${totalTracks} total tracks.`,
			summary: {
				playlistsCreated,
				totalTracks,
				totalGenres: genreEntries.length,
				songsProcessed: allSongs.total,
			},
			playlists: createdPlaylists,
		}

		console.log(`🎊 Organization complete: ${JSON.stringify(finalResult.summary)}`)
		return finalResult
	}
	catch (error) {
		const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred'
		console.error('❌ Server-side organization failed:', errorMessage)

		throw createError({
			statusCode: 500,
			statusMessage: `Organization failed: ${errorMessage}`,
		})
	}
})
