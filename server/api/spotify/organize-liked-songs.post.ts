/* eslint-disable @typescript-eslint/no-explicit-any */
import { serverSupabaseSession, serverSupabaseClient, serverSupabaseUser } from '#supabase/server'
import { useSpotifyApi } from '~/composables/useSpotifyApi'
import { useGenreOrganization } from '~/composables/useGenreOrganization'
import { useDatabaseOperations } from '~/composables/useDatabaseOperations'
import { getImageFileNameForGenre } from '~/utils/genreMapping'

export default defineEventHandler(async (event) => {
	try {
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

		const { getUserLikedSongs, getUserProfile, createPlaylist, addTracksToPlaylist, addImageToPlaylist } = useSpotifyApi()
		const { organizeByGenre } = useGenreOrganization(session.provider_token)
		const {
			getUnprocessedSongs,
			getPlaylistIdForGenre,
			storePlaylistId,
			markSongsAsProcessed,
		} = useDatabaseOperations(supabase)

		const allLikedSongs = await getUserLikedSongs(session.provider_token)

		const unprocessedSongs = await getUnprocessedSongs(user.id, allLikedSongs.items)

		if (unprocessedSongs.length === 0) {
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

		const organizedSongs = await organizeByGenre(unprocessedSongs)

		const genreEntries = Object.entries(organizedSongs)
			.filter(([_genre, songs]) => songs.length > 0)
			.sort(([, songsA], [, songsB]) => songsB.length - songsA.length)

		const userProfile = await getUserProfile(session.provider_token)
		const spotifyUserId = userProfile.id

		let playlistsCreated = 0
		let playlistsUpdated = 0
		let totalSongsAdded = 0
		const processedGenres: string[] = []

		for (const [genre, songs] of genreEntries) {
			try {
				const { playlistId: existingPlaylistId, columnName } = await getPlaylistIdForGenre(user.id, genre)

				let playlistId: string

				if (existingPlaylistId) {
					playlistId = existingPlaylistId
					playlistsUpdated++
				}
				else {
					const playlistName = `${genre} - Organizify`
					const playlistDescription = `${genre} playlist automatically created by Organizify`

					const newPlaylist = await createPlaylist(
						spotifyUserId,
						playlistName,
						playlistDescription,
						true,
						session.provider_token,
					)

					playlistId = newPlaylist.id

					await storePlaylistId(user.id, columnName, playlistId)

					playlistsCreated++

					const imageFileName = getImageFileNameForGenre(genre)
					await addImageToPlaylist(playlistId, imageFileName, session.provider_token)
				}

				const trackIds = songs.map((item: any) => {
					const track = item.track || item
					return track?.id
				}).filter((id) => {
					if (!id || typeof id !== 'string') return false
					if (id.length !== 22) return false
					if (!/^[a-zA-Z0-9]+$/.test(id)) return false
					return true
				})

				if (trackIds.length !== songs.length) {
					console.warn(`Filtered out ${songs.length - trackIds.length} invalid track IDs`)
				}

				if (trackIds.length > 0) {
					const validTrackIds = []

					for (const trackId of trackIds) {
						try {
							await addTracksToPlaylist(playlistId, [trackId], session.provider_token)
							validTrackIds.push(trackId)
						}
						catch (error) {
							console.error(`❌${error} Invalid track ID: ${trackId}`)
						}
					}

					if (validTrackIds.length > 0) {
						const addResult = await addTracksToPlaylist(playlistId, validTrackIds, session.provider_token)
						totalSongsAdded += addResult.tracksAdded
						if (addResult.tracksAdded > 0) {
							processedGenres.push(genre)
						}
					}

					await markSongsAsProcessed(user.id, songs, genre)
				}
				else {
					console.warn(`⚠️ No valid track IDs found for ${genre}`)

					await markSongsAsProcessed(user.id, songs, genre)
				}
			}
			catch (error) {
				const errorMessage = error instanceof Error ? error.message : 'Unknown error'
				console.error(`❌ Failed to process ${genre} genre:`, errorMessage)
			}
		}

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
			genreBreakdown,
			message: totalSongsAdded > 0
				? `Successfully organized ${totalSongsAdded} songs into ${processedGenres.length} genre${processedGenres.length === 1 ? '' : 's'}!`
				: 'All your Liked Songs are organized.',
		}

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
