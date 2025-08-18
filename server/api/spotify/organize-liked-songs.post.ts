/* eslint-disable @typescript-eslint/no-explicit-any */

import { serverSupabaseSession } from '#supabase/server'

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

		const allLikedSongs = await getAllUserLikedSongs(session.provider_token) // TODO call composable instead with the session.provider_token
		console.log(`📦 Loaded ${allLikedSongs.total} songs from user's library`)

		// Step 2: Organize songs by genre using server-side implementation
		// We implement this directly here instead of using the composable
		// because the composable has dependencies on useSpotifyApi that don't work in server context
		const organizedSongs = await organizeByGenreServerSide(allLikedSongs.items, session.provider_token)
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

		// Step 4: Create playlists for each genre directly (no internal API calls)
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
	}
	catch (error) {
		// Log detailed error on server for debugging
		const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred'
		console.error('❌ Server-side organization failed:', errorMessage)

		// Return sanitized error message to client
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

/**
 * Server-side function to fetch all user's liked songs
 * This replaces the useSpotifyApi composable functionality in the server context
 */
async function getAllUserLikedSongs(accessToken: string) {
	console.log('📦 Starting to fetch ALL liked songs from server...')

	const allSongs: any[] = []
	let offset = 0
	const limit = 50 // Spotify's maximum per request
	let hasMore = true

	// Continue fetching until we have all songs
	while (hasMore) {
		console.log(`📥 Fetching songs ${offset}-${offset + limit - 1}...`)

		// Make direct API call to Spotify (server-side, no composable needed)
		const response = await fetch(`https://api.spotify.com/v1/me/tracks?limit=${limit}&offset=${offset}`, {
			headers: {
				'Authorization': `Bearer ${accessToken}`,
				'Content-Type': 'application/json',
			},
		})

		if (!response.ok) {
			const errorText = await response.text()
			console.error('Spotify API error:', response.status, errorText)
			throw new Error(`Failed to fetch liked songs: ${response.status}`)
		}

		const batch = await response.json()
		console.log(`📊 Batch info: got ${batch.items?.length} items, total available: ${batch.total}`)

		if (batch.items && batch.items.length > 0) {
			allSongs.push(...batch.items)
			console.log(`✅ Got ${batch.items.length} songs. Total so far: ${allSongs.length}`)

			// Check if we've reached the end
			if (batch.items.length < limit || allSongs.length >= batch.total) {
				hasMore = false
				console.log(`🎯 Finished! Got all ${allSongs.length} liked songs`)
			}
			else {
				offset += limit
			}
		}
		else {
			hasMore = false
			console.log('🔚 No more songs to fetch')
		}
	}

	// Return in consistent format
	return {
		items: allSongs,
		total: allSongs.length,
	}
}

/**
 * Server-side genre organization function
 * This implements the same logic as useGenreOrganization but works in server context
 */
async function organizeByGenreServerSide(tracks: any[], accessToken: string) {
	console.log(`🎯 Organizing ${tracks.length} tracks by genre on server...`)

	// Genre mapping - copied from the original composable
	const GENRE_MAPPING = {
		Pop: [
			'pop', 'dance pop', 'latin pop', 'new wave pop', 'indonesian pop', 'k-pop',
			'singer-songwriter pop', 'modern country pop', 'alt z', 'opm', 'indietronica',
			'turkish pop', 'italian pop', 'j-pop', 'mexican pop', 'indie pop', 'spanish pop',
			'sertanejo pop', 'latin arena pop', 'synthpop', 'sped up', 'hip pop', 'desi pop',
			'eurodance', 'italian adult pop', 'french pop', 'german pop', 'post-teen pop',
			'art pop', 'nigerian pop', 't-pop', 'europop', 'chamber pop', 'mandopop', 'uk pop',
			'punjabi pop', 'swedish pop', 'v-pop', 'neon pop punk', 'classic italian pop',
			'k-pop girl group', 'britpop', 'polish pop', 'chinese viral pop', 'danish pop',
			'dutch pop', 'arab pop', 'girl group', 'meme', 'gen z singer-songwriter',
			'afropop', 'k-pop boy group', 'folk-pop', 'russian pop', 'electropop',
			'classic country pop', 'cumbia pop', 'talent show', 'french indie pop',
			'latin viral pop', 'boy band', 'reggae fusion', '5th gen k-pop', 'colombian pop',
			'korean pop', 'acoustic pop', 'country pop', 'malaysian pop', 'neo-synthpop',
			'arabesk', 'bubblegum pop', 'cantopop', 'thai pop', 'finnish pop', 'canadian pop',
			'viral pop', 'classic swedish pop', 'funk rj',
		],
		Rock: [
			'rock', 'alternative rock', 'indie rock', 'classic rock', 'punk', 'punk rock',
			'garage rock', 'psychedelic rock', 'grunge', 'alternative', 'indie', 'emo',
			'post-punk', 'new wave', 'britrock', 'college rock', 'modern rock', 'art rock',
			'progressive rock', 'glam rock', 'southern rock', 'blues rock',
			'country rock', 'roots rock', 'heartland rock', 'arena rock', 'surf rock',
			'garage rock revival', 'post-punk revival', 'neo-psychedelic',
		],
		Metal: [
			'metal', 'alternative metal', 'post-grunge', 'nu metal', 'glam metal',
			'metalcore', 'rap metal', 'melodic metalcore', 'power metal', 'industrial metal',
			'screamo', 'symphonic metal', 'skate punk', 'speed metal', 'groove metal',
			'deathcore', 'thrash metal', 'death metal', 'funk metal', 'uptempo hardcore',
			'progressive metal', 'stoner metal', 'hardcore punk', 'gothic metal',
			'gothic symphonic metal', 'djent', 'melodic death metal', 'black metal',
			'german metal', 'metallic hardcore', 'progressive post-hardcore',
			'brutal death metal', 'comic metal', 'sludge metal', 'melodic metal',
			'heavy metal', 'old school thrash', 'technical death metal', 'deathgrind',
			'melodic hardcore', 'spanish metal', 'trancecore', 'post-metal',
		],
		Hip_Hop: [
			'hip hop', 'rap', 'drill', 'grime', 'conscious hip hop', 'east coast hip hop',
			'west coast rap', 'southern hip hop', 'gangsta rap', 'alternative hip hop',
			'experimental hip hop', 'old school hip hop', 'boom bap', 'cloud rap',
			'mumble rap', 'latin hip hop', 'uk hip hop', 'french hip hop', 'german hip hop',
			'trap', 'gym phonk', 'swedish trap pop', 'dutch rap pop', 'canadian hip hop',
		],
		Electronic: [
			'electronic', 'house', 'techno', 'dubstep', 'edm', 'ambient', 'trance',
			'drum and bass', 'breakbeat', 'garage', 'jungle', 'hardcore', 'hardstyle',
			'progressive house', 'deep house', 'tech house', 'minimal techno', 'acid house',
			'synthwave', 'vaporwave', 'chillwave', 'downtempo', 'idm', 'electronica',
			'electro', 'disco', 'nu-disco', 'future bass', 'glitch', 'drone', 'dark ambient',
			'new age',
		],
		R_and_B: [
			'r&b', 'soul', 'funk', 'neo soul', 'contemporary r&b', 'quiet storm',
			'new jack swing', 'hip hop soul', 'alternative r&b', 'urban contemporary',
		],
		Country: [
			'country', 'bluegrass', 'alt-country', 'outlaw country',
			'honky tonk', 'western', 'contemporary country',
		],
		Jazz: [
			'jazz', 'bebop', 'smooth jazz', 'fusion', 'cool jazz', 'hard bop', 'free jazz',
			'latin jazz', 'contemporary jazz', 'jazz funk', 'acid jazz', 'nu jazz',
			'swing', 'big band', 'ragtime', 'dixieland', 'modal jazz', 'post-bop',
		],
		Classical: [
			'classical', 'orchestral soundtrack', 'neo-classical', 'compositional ambient',
			'video game music', 'epicore', 'early modern classical', 'baroque',
			'post-romantic era', 'indian classical', 'early music', 'classical era',
			'late romantic era', 'impressionism', 'gregorian chant', 'renaissance',
			'cello', 'italian romanticism', 'orthodox chant', 'choral',
			'contemporary classical', 'neoclassicism', 'classical guitar', 'opera',
		],
		Folk_Acoustic: [
			'folk', 'acoustic', 'singer-songwriter', 'indie folk', 'alternative country',
			'americana', 'traditional folk', 'contemporary folk', 'acoustic rock',
			'fingerstyle', 'celtic', 'world music', 'protest song', 'roots', 'banjo',
			'mandolin', 'bluegrass', 'country folk', 'irish folk', 'scottish folk',
			'bedroom pop', 'indie poptimism', 'dream pop', 'folk rock',
		],
		Latin: [
			'latin', 'salsa', 'reggaeton', 'bachata', 'merengue', 'cumbia', 'bossa nova',
			'samba', 'tango', 'flamenco', 'mariachi', 'tejano', 'latin rock',
			'nueva cancion', 'bolero', 'mambo', 'cha cha cha', 'rumba',
		],
	}

	// Helper function to map Spotify genres to broad categories
	const mapGenresToBroadCategories = (spotifyGenres: string[]): string => {
		for (const genreToCheck of spotifyGenres) {
			for (const [broadGenre, subgenres] of Object.entries(GENRE_MAPPING)) {
				const hasMatch = subgenres.some(mappedGenre =>
					genreToCheck.toLowerCase().includes(mappedGenre.toLowerCase()),
				)
				if (hasMatch) {
					// Format genre names (replace underscores with spaces, etc.)
					return broadGenre.replace(/_/g, ' ').replace('R and B', 'R&B')
				}
			}
		}
		return 'Other'
	}

	// Step 1: Extract unique artist IDs
	const uniqueArtistIds = new Set<string>()
	tracks.forEach((item) => {
		const track = item.track || item
		const primaryArtist = track?.artists?.[0]
		if (primaryArtist?.id) {
			uniqueArtistIds.add(primaryArtist.id)
		}
		else {
			console.log('⚠️ Track without artist ID:', track?.name || 'Unknown track')
		}
	})

	console.log(`🎭 Found ${uniqueArtistIds.size} unique artists from ${tracks.length} tracks`)

	// Step 2: Fetch artist data in batches using server-side API calls
	const artistCache = new Map<string, string[]>()
	const artistIds = Array.from(uniqueArtistIds)
	const batchSize = 50

	for (let i = 0; i < artistIds.length; i += batchSize) {
		const batch = artistIds.slice(i, i + batchSize)

		try {
			const response = await fetch(`https://api.spotify.com/v1/artists?ids=${batch.join(',')}`, {
				headers: {
					'Authorization': `Bearer ${accessToken}`,
					'Content-Type': 'application/json',
				},
			})

			if (!response.ok) {
				const errorText = await response.text()
				console.error(`Failed to fetch artists batch: ${response.status} - ${errorText}`)
				continue // Skip this batch but continue with others
			}

			const artistData = await response.json()

			if (artistData.artists) {
				artistData.artists.forEach((artist: any) => {
					if (artist?.id) {
						artistCache.set(artist.id, artist.genres || [])
						console.log(`🎤 Artist: ${artist.name} - Genres: [${artist.genres?.join(', ') || 'No genres'}]`)
					}
				})
			}

			console.log(`✅ Fetched artist data: ${i + batch.length}/${artistIds.length}`)
		}
		catch (error) {
			console.error(`❌ Error fetching artist batch:`, error)
			// Continue with next batch
		}
	}

	console.log(`📊 Artist cache populated with ${artistCache.size} artists`)

	// Step 3: Organize tracks by genre
	const tracksByGenre: Record<string, any[]> = {}

	tracks.forEach((item, index) => {
		const track = item.track || item
		const primaryArtist = track?.artists?.[0]

		console.log(`🎵 Processing track ${index + 1}: "${track?.name}" by ${primaryArtist?.name}`)

		if (primaryArtist?.id) {
			const artistGenres = artistCache.get(primaryArtist.id) || []
			const broadGenre = mapGenresToBroadCategories(artistGenres)

			console.log(`  📂 Artist genres: [${artistGenres.join(', ') || 'None'}] → Mapped to: "${broadGenre}"`)

			if (!tracksByGenre[broadGenre]) {
				tracksByGenre[broadGenre] = []
			}

			tracksByGenre[broadGenre].push(item)
		}
		else {
			console.log(`  ⚠️ No artist ID found for track`)
		}
	})

	// Debug: Show what we ended up with
	console.log('\n🎼 Final genre distribution:')
	Object.entries(tracksByGenre).forEach(([genre, songs]) => {
		console.log(`  ${genre}: ${songs.length} songs`)
	})

	console.log(`✅ Organization complete: ${Object.keys(tracksByGenre).length} categories created`)
	return tracksByGenre
}
