/* eslint-disable @typescript-eslint/no-explicit-any */

import { getPlaylistColumnForGenre, type UserGenrePlaylist } from '~/utils/genreMapping'

export const useDatabaseOperations = (customSupabase?: any) => {
	const supabase = customSupabase || useSupabaseClient()

	const getUnprocessedSongs = async (userId: string, allLikedSongs: any[]) => {
		try {
			const { data: processedSongs, error } = await supabase
				.from('user_processed_songs')
				.select('spotify_track_id')
				.eq('user_id', userId)

			if (error) {
				console.error('Error fetching processed songs:', error)
				throw error
			}

			const processedTrackIds = new Set(
				processedSongs?.map((song: { spotify_track_id: any }) => song.spotify_track_id) || [],
			)

			const unprocessedSongs = allLikedSongs.filter((item) => {
				const trackId = item.track?.id || item.id
				return !processedTrackIds.has(trackId)
			})
			return unprocessedSongs
		}
		catch (error) {
			console.error('Failed to get unprocessed songs:', error)
			throw error
		}
	}

	const getPlaylistIdForGenre = async (userId: string, genre: string): Promise<{ playlistId: string | null, columnName: string }> => {
		try {
			const columnName = getPlaylistColumnForGenre(genre)

			const { data: userPlaylist, error } = await supabase
				.from('user_genre_playlists')
				.select(columnName)
				.eq('user_id', userId)
				.single()

			if (error) {
				if (error.code === 'PGRST116') { // PostgreSQL "no rows returned" error
					return { playlistId: null, columnName: columnName }
				}
				throw error
			}

			const playlistId = userPlaylist?.[columnName as keyof typeof userPlaylist] as string | null

			return { playlistId, columnName }
		}
		catch (error) {
			console.error(`Failed to get playlist ID for genre ${genre}:`, error)
			throw error
		}
	}

	const storePlaylistId = async (userId: string, columnName: string, playlistId: string) => {
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
		}
		catch (error) {
			console.error(`Failed to store playlist ID:`, error)
			throw error
		}
	}

	const markSongsAsProcessed = async (userId: string, songs: any[], genre: string) => {
		try {
			const records = songs.map(song => ({
				user_id: userId,
				spotify_track_id: song.track?.id || song.id,
				genre: genre,
				created_at: new Date().toISOString(),
			}))

			const { error } = await supabase
				.from('user_processed_songs')
				.insert(records)

			if (error) {
				throw error
			}
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
