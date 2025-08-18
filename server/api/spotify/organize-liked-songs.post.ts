import { serverSupabaseSession } from '#supabase/server'
import { useSpotifyApi } from '~/composables/useSpotifyApi'

export default defineEventHandler(async (_event) => {
	try {
		const session = await serverSupabaseSession(_event)
		if (!session?.provider_token) {
			throw createError({
				statusCode: 401,
				statusMessage: 'Authentication required',
				data: {
					code: 'authentication_required',
					message: 'Please log in with Spotify to organize your music',
				},
			})
		}

		console.log('🎵 Starting genre organization on server...')
		const { getUserLikedSongs } = useSpotifyApi()
		const allLikedSongs = await getUserLikedSongs(session.provider_token)
		console.log(`📦 Loaded ${allLikedSongs.total} songs from user's library`)

		return allLikedSongs
		/*
		const { organizeByGenre } = useGenreOrganization()
		const organizedSongs = await organizeByGenre(allLikedSongs.items)
		console.log(`🎼 Organized songs into ${Object.keys(organizedSongs).length} genres`)

		// Step 3: Filter and sort genres by song count
		const genreEntries = Object.entries(organizedSongs)
			.filter(([_genre, songs]) => songs.length > 0)
			.sort(([, songsA], [, songsB]) => songsB.length - songsA.length)

		// Debug: Show what we're working with after filtering
		console.log('\n🔍 Genre entries after filtering:')
		genreEntries.forEach(([genre, songs]) => {
			console.log(`  ${genre}: ${songs.length} songs`)
		})

		// Early return if no songs to organize
		if (genreEntries.length === 0) {
			console.log('❌ No genres with songs found after filtering')
			return {
				success: false,
				message: 'No songs found to organize',
				playlistsCreated: 0,
				totalTracks: 0,
			}
		}

		console.log(`🎼 Ready to create ${genreEntries.length} playlists...`)

		// Step 4: Create playlists for each genre
		// TODO use composable to create playlists
		let playlistsCreated = 0
		let totalTracks = 0
		const createdPlaylists = []

		for (const [genre, songs] of genreEntries) {
			try {
				console.log(`📁 Creating "${genre}" playlist (${playlistsCreated + 1}/${genreEntries.length})...`)

				// Create the playlist directly using Spotify API (not internal API call)
				const playlistName = `${genre} - Organizify`
				const playlistDescription = `${genre} playlist made by Organizify`

				const createResponse = await fetch(`https://api.spotify.com/v1/me/playlists`, {
					method: 'POST',
					headers: {
						'Authorization': `Bearer ${session.provider_token}`,
						'Content-Type': 'application/json',
					},
					body: JSON.stringify({
						name: playlistName,
						description: playlistDescription,
						public: false, // Keep playlists private by default
					}),
				})

				if (!createResponse.ok) {
					const errorText = await createResponse.text()
					console.error(`Failed to create playlist "${genre}": ${createResponse.status} - ${errorText}`)
					continue // Skip this genre but continue with others
				}

				const playlistData = await createResponse.json()
				console.log(`✅ Created playlist "${playlistName}" with ID: ${playlistData.id}`)

				// Extract track IDs for adding to playlist
				const trackIds = songs.map((item: any) => {
					const track = item.track || item
					return track.id
				}).filter(Boolean)

				// Add tracks to playlist directly using Spotify API
				if (trackIds.length > 0) {
					// Convert track IDs to Spotify URIs format
					const trackUris = trackIds.map(id => `spotify:track:${id}`)

					// Spotify allows max 100 tracks per request, so batch them
					const batchSize = 100
					let tracksAdded = 0

					for (let i = 0; i < trackUris.length; i += batchSize) {
						const batch = trackUris.slice(i, i + batchSize)

						const addTracksResponse = await fetch(`https://api.spotify.com/v1/playlists/${playlistData.id}/tracks`, {
							method: 'POST',
							headers: {
								'Authorization': `Bearer ${session.provider_token}`,
								'Content-Type': 'application/json',
							},
							body: JSON.stringify({
								uris: batch,
							}),
						})

						if (!addTracksResponse.ok) {
							const errorText = await addTracksResponse.text()
							console.error(`Failed to add tracks to playlist: ${addTracksResponse.status} - ${errorText}`)
						}
						else {
							tracksAdded += batch.length
							console.log(`✅ Added ${batch.length} tracks to "${genre}" playlist`)
						}
					}

					if (tracksAdded > 0) {
						playlistsCreated++
						totalTracks += tracksAdded

						createdPlaylists.push({
							genre: genre,
							playlistId: playlistData.id,
							playlistName: playlistData.name,
							trackCount: tracksAdded,
						})

						console.log(`🎉 Successfully created "${genre}" playlist with ${tracksAdded} songs`)
					}
				}
			}
			catch (error) {
				// Log detailed error on server, but continue with other genres
				const errorMessage = error instanceof Error ? error.message : 'Unknown error'
				console.error(`❌ Failed to create "${genre}" playlist:`, errorMessage)
				// Continue processing other genres rather than failing completely
			}
		}

		// Return success response with summary
		const finalResult = {
			success: true,
			message: `Successfully organized your music! Created ${playlistsCreated} playlists with ${totalTracks} total tracks.`,
			summary: {
				playlistsCreated,
				totalTracks,
				totalGenres: genreEntries.length,
				songsProcessed: allLikedSongs.total,
			},
			playlists: createdPlaylists,
		}

		console.log(`🎊 Organization complete: ${JSON.stringify(finalResult.summary)}`)
		return finalResult
		*/
	}
	catch (error) {
		const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred'
		console.error('❌ Server-side organization failed:', errorMessage)

		throw createError({
			statusCode: 500,
			statusMessage: 'Music organization failed',
			data: {
				code: 'organization_failed',
				message: 'Unable to organize your music at this time. Please try again later.',
			},
		})
	}
})
