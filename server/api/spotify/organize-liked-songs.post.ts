/* eslint-disable @typescript-eslint/no-explicit-any */

import { serverSupabaseSession, serverSupabaseClient, serverSupabaseUser } from '#supabase/server'
import { useSpotifyApi } from '~/composables/useSpotifyApi'
import { useGenreOrganization } from '~/composables/useGenreOrganization'
import { useDatabaseOperations } from '~/composables/useDatabaseOperations'

export default defineEventHandler(async (event) => {
	try {
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

		const { getUserLikedSongs, getUserProfile, createPlaylist, addTracksToPlaylist } = useSpotifyApi()
		const { organizeByGenre } = useGenreOrganization(session.provider_token)
		const {
			getUnprocessedSongs,
			getPlaylistIdForGenre,
			storePlaylistId,
			markSongsAsProcessed,
		} = useDatabaseOperations(supabase)

		console.log('📦 Fetching all liked songs from Spotify...')
		const allLikedSongs = await getUserLikedSongs(session.provider_token)
		console.log(`📊 Total liked songs: ${allLikedSongs.total}`)

		console.log('🔍 Finding unprocessed songs...')
		const unprocessedSongs = await getUnprocessedSongs(user.id, allLikedSongs.items)
		console.log(`🆕 Unprocessed songs to organize: ${unprocessedSongs.length}`)

		if (unprocessedSongs.length === 0) {
			console.log('✅ No new songs to process')
			return {
				success: true,
				newSongsProcessed: 0,
				playlistsCreated: 0,
				playlistsUpdated: 0,
				totalSongsAdded: 0,
				processedGenres: [], // Add this to match the final result structure
				message: 'Your music is already organized! No new songs found.',
			}
		}

		console.log('🎯 Organizing unprocessed songs by genre...')
		const organizedSongs = await organizeByGenre(unprocessedSongs)

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

				const { playlistId: existingPlaylistId, columnName } = await getPlaylistIdForGenre(user.id, genre)

				let playlistId: string

				if (existingPlaylistId) {
					console.log(`✅ Found existing ${genre} playlist: ${existingPlaylistId}`)
					playlistId = existingPlaylistId
					playlistsUpdated++
				}
				else {
					console.log(`📁 Creating new ${genre} playlist...`)
					const playlistName = `${genre} - Organizify`
					const playlistDescription = `${genre} playlist automatically created by Organizify`

					const newPlaylist = await createPlaylist(
						spotifyUserId,
						playlistName,
						playlistDescription,
						true, // Keep public
						session.provider_token,
					)

					playlistId = newPlaylist.id
					console.log(`✅ Created new playlist: ${playlistName} (${playlistId})`)

					// Store the new playlist ID in database
					await storePlaylistId(user.id, columnName, playlistId)
					console.log(`💾 Stored playlist ID in database`)

					playlistsCreated++
				}

				const trackIds = songs.map((item: any) => {
					const track = item.track || item
					return track.id
				}).filter(Boolean) // Remove any null/undefined IDs

				if (trackIds.length > 0) {
					console.log(`🎵 Adding ${trackIds.length} tracks to ${genre} playlist...`)
					const addResult = await addTracksToPlaylist(playlistId, trackIds, session.provider_token)

					if (addResult.tracksAdded > 0) {
						totalSongsAdded += addResult.tracksAdded
						console.log(`✅ Successfully added ${addResult.tracksAdded} tracks to ${genre} playlist`)

						await markSongsAsProcessed(user.id, songs, genre)
						console.log(`📝 Marked ${songs.length} songs as processed`)

						processedGenres.push(genre)
					}
					else {
						console.warn(`⚠️ No tracks were added to ${genre} playlist`)
					}
				}
			}
			catch (error) {
				const errorMessage = error instanceof Error ? error.message : 'Unknown error'
				console.error(`❌ Failed to process ${genre} genre:`, errorMessage)
			}
		}

		const finalResult = {
			success: true,
			newSongsProcessed: unprocessedSongs.length,
			playlistsCreated,
			playlistsUpdated,
			totalSongsAdded,
			processedGenres,
			message: totalSongsAdded > 0
				? `Organized ${totalSongsAdded} songs into ${processedGenres.length} genre${processedGenres.length === 1 ? '' : 's'}!`
				: 'Organization completed, but no songs were added. Check your Spotify connection.',
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
