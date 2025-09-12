/* eslint-disable @typescript-eslint/no-explicit-any */
// server/api/spotify/organize-liked-songs.post.ts
import { serverSupabaseSession, serverSupabaseClient, serverSupabaseUser } from '#supabase/server'
import { useSpotifyApi } from '~/composables/useSpotifyApi'
import { useGenreOrganization } from '~/composables/useGenreOrganization'
import { useDatabaseOperations } from '~/composables/useDatabaseOperations'
import { getImageFileNameForGenre } from '~/utils/genreMapping'

export default defineEventHandler(async (event) => {
	try {
		// Step 1: Authentication & Setup
		console.log('🎵 Starting sync process...')

		const session = await serverSupabaseSession(event)
		const user = await serverSupabaseUser(event)
		const supabase = await serverSupabaseClient(event)

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

		if (!user?.id) {
			throw createError({
				statusCode: 401,
				statusMessage: 'User ID not available',
				data: {
					code: 'user_id_missing',
					message: 'Could not determine user ID from session',
				},
			})
		}

		// Step 2: Initialize composables with proper context
		const { getUserLikedSongs, getUserProfile, createPlaylist, addTracksToPlaylist, addImageToPlaylist } = useSpotifyApi()
		const { organizeByGenre } = useGenreOrganization(session.provider_token)
		const {
			getUnprocessedSongs,
			getPlaylistIdForGenre,
			storePlaylistId,
			markSongsAsProcessed,
		} = useDatabaseOperations(supabase)

		// Step 3: Fetch all liked songs from Spotify
		console.log('📦 Fetching all liked songs from Spotify...')
		const allLikedSongs = await getUserLikedSongs(session.provider_token)
		console.log(`📊 Total liked songs: ${allLikedSongs.total}`)

		// Step 4: Find only unprocessed songs (this is the key for incremental sync!)
		console.log('🔍 Finding unprocessed songs...')
		const unprocessedSongs = await getUnprocessedSongs(user.id, allLikedSongs.items)
		console.log(`🆕 Unprocessed songs to organize: ${unprocessedSongs.length}`)

		// Early return if no new songs to process
		if (unprocessedSongs.length === 0) {
			console.log('✅ No new songs to process')
			return {
				success: true,
				newSongsProcessed: 0,
				playlistsCreated: 0,
				playlistsUpdated: 0,
				totalSongsAdded: 0,
				createdGenres: [],
				updatedGenres: [],
				message: 'All your Liked Songs are organized.',
			}
		}

		// Step 5: Organize unprocessed songs by genre
		console.log('🎯 Organizing unprocessed songs by genre...')
		const organizedSongs = await organizeByGenre(unprocessedSongs)

		// Filter out empty genres
		const genreEntries = Object.entries(organizedSongs)
			.filter(([_genre, songs]) => songs.length > 0)
			.sort(([, songsA], [, songsB]) => songsB.length - songsA.length)

		console.log('\n🔍 Genres found in new songs:')
		genreEntries.forEach(([genre, songs]) => {
			console.log(`  ${genre}: ${songs.length} songs`)
		})

		const userProfile = await getUserProfile(session.provider_token)
		const spotifyUserId = userProfile.id

		let playlistsCreated = 0
		let playlistsUpdated = 0
		let totalSongsAdded = 0
		const processedGenres: string[] = []

		for (const [genre, songs] of genreEntries) {
			try {
				console.log(`\n🎵 Processing ${genre} genre (${songs.length} songs)...`)

				// Check if user already has a playlist for this genre
				const { playlistId: existingPlaylistId, columnName } = await getPlaylistIdForGenre(user.id, genre)

				let playlistId: string

				if (existingPlaylistId) {
					// Use existing playlist
					console.log(`✅ Found existing ${genre} playlist: ${existingPlaylistId}`)
					playlistId = existingPlaylistId
					playlistsUpdated++
				}
				else {
					// Create new playlist
					console.log(`📁 Creating new ${genre} playlist...`)
					const playlistName = `${genre} - Organizify`
					const playlistDescription = `${genre} playlist automatically created by Organizify`

					const newPlaylist = await createPlaylist(
						spotifyUserId,
						playlistName,
						playlistDescription,
						false, // Keep private
						session.provider_token,
					)

					playlistId = newPlaylist.id
					console.log(`✅ Created new playlist: ${playlistName} (${playlistId})`)

					// Store the new playlist ID in database
					await storePlaylistId(user.id, columnName, playlistId)
					console.log(`💾 Stored playlist ID in database`)
					playlistsCreated++
					// add image cover to the playlist
					const imageFileName = getImageFileNameForGenre(genre)
					const imageAdded = await addImageToPlaylist(playlistId, imageFileName, session.provider_token)
					if (imageAdded) console.log(`Added cover image: ${imageFileName}`)
				}

				const trackIds = songs.map((item: any) => {
					const track = item.track || item
					return track?.id
				}).filter((id) => {
					// Validate Spotify track ID format (22 chars, alphanumeric)
					if (!id || typeof id !== 'string') return false
					if (id.length !== 22) return false
					if (!/^[a-zA-Z0-9]+$/.test(id)) return false
					return true
				})

				console.log(`Valid track IDs for ${genre}: ${trackIds.length}/${songs.length}`)
				if (trackIds.length !== songs.length) {
					console.warn(`Filtered out ${songs.length - trackIds.length} invalid track IDs`)
				}

				// Add tracks to playlist using our composable
				// After the track ID validation:
				// Replace the batch adding with individual track testing:
				if (trackIds.length > 0) {
					console.log(`🎵 Testing individual tracks for ${genre}...`)
					const validTrackIds = []

					for (const trackId of trackIds) {
						try {
							// Test adding one track at a time
							await addTracksToPlaylist(playlistId, [trackId], session.provider_token)
							validTrackIds.push(trackId)
							console.log(`✅ Track ${trackId} is valid`)
						}
						catch (error) {
							console.error(`❌${error} Invalid track ID: ${trackId}`)
						}
					}

					console.log(`Found ${validTrackIds.length} truly valid tracks out of ${trackIds.length}`)

					// Now add all valid tracks in one batch
					if (validTrackIds.length > 0) {
						const addResult = await addTracksToPlaylist(playlistId, validTrackIds, session.provider_token)
						totalSongsAdded += addResult.tracksAdded
						if (addResult.tracksAdded > 0) {
							processedGenres.push(genre)
						}
					}

					// Always mark as processed
					await markSongsAsProcessed(user.id, songs, genre)
				}
				else {
					console.warn(`⚠️ No valid track IDs found for ${genre}`)
					// Mark as processed to avoid reprocessing songs with bad IDs
					await markSongsAsProcessed(user.id, songs, genre)
				}
			}
			catch (error) {
				// Log error but continue with other genres
				const errorMessage = error instanceof Error ? error.message : 'Unknown error'
				console.error(`❌ Failed to process ${genre} genre:`, errorMessage)
				// Don't throw - continue processing other genres
			}
		}

		// Step 8: Return comprehensive summary for toast UI
		const genreBreakdown = processedGenres.map((genre) => {
			const genreEntry = genreEntries.find(([g]) => g === genre)
			return {
				genre,
				count: genreEntry ? genreEntry[1].length : 0,
			}
		})

		const finalResult = {
			success: true,
			newSongsProcessed: unprocessedSongs.length,
			playlistsCreated,
			playlistsUpdated,
			totalSongsAdded,
			processedGenres,
			genreBreakdown, // Add this
			message: totalSongsAdded > 0
				? `Successfully organized ${totalSongsAdded} songs into ${processedGenres.length} genre${processedGenres.length === 1 ? '' : 's'}!`
				: 'All your Liked Songs are organized.',
		}

		console.log(`🎊 Sync complete:`, finalResult)
		return finalResult
	}
	catch (error) {
		const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred'
		console.error('❌ Sync process failed:', errorMessage)

		throw createError({
			statusCode: 500,
			statusMessage: 'Music organization failed',
			data: {
				code: 'organization_failed',
				message: 'Unable to organize your music at this time. Please try again later.',
				originalError: errorMessage,
			},
		})
	}
})
