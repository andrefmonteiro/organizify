/* eslint-disable @typescript-eslint/no-explicit-any */

import { getPlaylistColumnForGenre, type UserGenrePlaylist } from '~/utils/genreMapping'

export const useDatabaseOperations = (customSupabase?: any) => {
	const supabase = customSupabase || useSupabaseClient()

	const getUnprocessedSongs = async (userId: string, allLikedSongs: any[]) => {
		console.log(`🔍 Checking for unprocessed songs for user: ${userId}`)

		try {
			const { data: processedSongs, error } = await supabase
				.from('user_processed_songs')
				.select('spotify_track_id')
				.eq('user_id', userId)

			if (error) {
				console.error('Error fetching processed songs:', error)
				throw error
			}

			// Set lookup is O(1) vs Array.includes() which is O(n)
			const processedTrackIds = new Set(
				processedSongs?.map((song: { spotify_track_id: any }) => song.spotify_track_id) || [],
			)

			const unprocessedSongs = allLikedSongs.filter((item) => {
				const trackId = item.track?.id || item.id
				return !processedTrackIds.has(trackId)
			})

			console.log(`📊 Found ${unprocessedSongs.length} unprocessed songs out of ${allLikedSongs.length} total`)
			return unprocessedSongs
		}
		catch (error) {
			console.error('Failed to get unprocessed songs:', error)
			throw error
		}
	}

	const getPlaylistIdForGenre = async (userId: string, genre: string): Promise<{ playlistId: string | null, columnName: string }> => {
		console.log(`🎵 Checking if user has playlist for genre: ${genre}`)

		try {
			const columnName = getPlaylistColumnForGenre(genre)

			const { data: userPlaylist, error } = await supabase
				.from('user_genre_playlists')
				.select(columnName)
				.eq('user_id', userId)
				.single()

			if (error) {
				if (error.code === 'PGRST116') { // PostgreSQL "no rows returned" error
					console.log(`📝 No playlist record found for user ${userId}, will create one`)
					return { playlistId: null, columnName: columnName }
				}
				throw error
			}

			const playlistId = userPlaylist?.[columnName as keyof typeof userPlaylist] as string | null
			console.log(`${playlistId ? '✅' : '❌'} Playlist ${playlistId ? 'found' : 'not found'} for ${genre}`)

			return { playlistId, columnName }
		}
		catch (error) {
			console.error(`Failed to get playlist ID for genre ${genre}:`, error)
			throw error
		}
	}

	const storePlaylistId = async (userId: string, columnName: string, playlistId: string) => {
		console.log(`💾 Storing playlist ID for user ${userId}, column: ${columnName}`)

		try {
			const { error } = await supabase
				.from('user_genre_playlists')
				.upsert({
					user_id: userId,
					[columnName]: playlistId,
					updated_at: new Date().toISOString(),
				})

			if (error) {
				throw error
			}

			console.log(`✅ Successfully stored playlist ID: ${playlistId}`)
		}
		catch (error) {
			console.error(`Failed to store playlist ID:`, error)
			throw error
		}
	}

	const markSongsAsProcessed = async (userId: string, songs: any[], genre: string) => {
		console.log(`📝 Marking ${songs.length} songs as processed for genre: ${genre}`)

		try {
			const records = songs.map(song => ({
				user_id: userId,
				spotify_track_id: song.track?.id || song.id,
				genre: genre, // Store the display name like "Hip-Hop"
				created_at: new Date().toISOString(),
			}))

			const { error } = await supabase
				.from('user_processed_songs')
				.insert(records)

			if (error) {
				throw error
			}

			console.log(`✅ Successfully marked ${records.length} songs as processed`)
		}
		catch (error) {
			console.error(`Failed to mark songs as processed:`, error)
			throw error
		}
	}

	const getUserPlaylistIds = async (userId: string): Promise<UserGenrePlaylist | null> => {
		try {
			const { data, error } = await supabase
				.from('user_genre_playlists')
				.select('*')
				.eq('user_id', userId)
				.single()

			if (error && error.code !== 'PGRST116') {
				throw error
			}

			return data
		}
		catch (error) {
			console.error('Failed to get user playlist IDs:', error)
			return null
		}
	}

	return {
		getUnprocessedSongs,
		getPlaylistIdForGenre,
		storePlaylistId,
		markSongsAsProcessed,
		getUserPlaylistIds,
	}
}
