/* eslint-disable @typescript-eslint/no-explicit-any */
/**
 *  Architecture:
 * 1. Always try server endpoint first (uses serverSupabaseSession)
 * 2. If server has no provider tokens, fallback to client-side tokens
 * 3. Transparent to the calling code - just call getUserProfile(), getPlaylists(), etc.
 */

export const useSpotifyApi = () => {
	const makeClientSideSpotifyCall = async (
		endpoint: string,
		options: RequestInit = {},
	) => { // can you teach me better about this function?
		const { getClientSideSpotifyTokens } = useSpotifyPermissions()
		const { accessToken } = getClientSideSpotifyTokens()

		if (!accessToken) {
			throw new Error('No access token available client-side')
		}
		const response = await fetch(`https://api.spotify.com/v1${endpoint}`, {
			...options,
			headers: {
				Authorization: `Bearer ${accessToken}`,
				...options.headers,
			},
		})
		if (!response.ok) {
			throw new Error(`Spotify API error: ${response.status}`)
		}
		return await response.json()
	}

	const getUserProfile = async () => {
		try {
			return await $fetch('/api/spotify/user-profile')
		}
		catch (error: any) {
			if (error.data?.code === 'no_provider_tokens') {
				console.log('🚨 EDGE CASE: Using client-side tokens for getUserProfile')
				return await makeClientSideSpotifyCall('/me')
			}
			throw error
		}
	}

	const getUserPlaylists = async () => {
		try {
			return await $fetch('/api/spotify/user-playlists')
		}
		catch (error: any) {
			if (error.data?.code === 'no_provider_tokens') {
				console.log('🚨 EDGE CASE: Using client-side tokens for getPlaylists')
				return await makeClientSideSpotifyCall('/me/playlists?limit=50')
			}
			throw error
		}
	}

	const getBatchLikedSongs = async (limit: number, offset: number = 0) => {
		try {
			return await $fetch('/api/spotify/user-liked-songs', {
				query: {
					limit: limit.toString(),
					offset: offset.toString(),
				},
			})
		}
		catch (error: any) {
			if (error.data?.code === 'no_provider_tokens') {
				console.log('🚨 EDGE CASE: Using client-side tokens for getUserLikedSongs')
				return await makeClientSideSpotifyCall(`/me/tracks?limit=${limit}&offset=${offset}`)
			}
			throw error
		}
	}

	const getUserLikedSongs = async () => {
		console.log('📦 Starting to fetch ALL liked songs...')

		const allSongs: any[] = []
		let offset = 0
		const limit = 50 // Max allowed by Spotify
		let hasMore = true

		while (hasMore) {
			console.log(`📥 Fetching songs ${offset}-${offset + limit - 1}...`)

			const batch = await getBatchLikedSongs(limit, offset)
			console.log(`📊 Batch info: got ${batch.items?.length} items, total in collection: ${batch.total}, our progress: ${allSongs.length}/${batch.total}`)

			if (batch.items && batch.items.length > 0) {
				allSongs.push(...batch.items)
				console.log(`✅ Got ${batch.items.length} songs. Total so far: ${allSongs.length}`)

				// Check if we've reached the end
				if (batch.items.length < limit || allSongs.length >= batch.total) { // i dont understand the second condition
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

		return {
			items: allSongs,
			total: allSongs.length,
		}
	}

	return {
		getUserProfile,
		getUserPlaylists,
		getUserLikedSongs, // we only need to expose this one, not the batch one. The batch one is internal helper
	}
}
