/* eslint-disable @typescript-eslint/no-explicit-any */

export const useSpotifyApi = () => {
	/**
	 * Client-side fallback function for when server-side tokens aren't available
	 * This function handles direct API calls to Spotify using client-side tokens
	 */
	const makeClientSideSpotifyCall = async (
		endpoint: string,
		options: RequestInit = {},
	) => {
		const { getClientSideSpotifyTokens } = useSpotifyPermissions()
		const { accessToken } = getClientSideSpotifyTokens()

		if (!accessToken) {
			throw new Error('No access token available client-side')
		}

		// Construct the full Spotify API URL and make the request
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

	/**
	 * Get the current user's Spotify profile information
	 */
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

	/**
	 * Get the current user's playlists
	 */
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

	/**
	 * Internal helper function to fetch a batch of liked songs
	 * This is used by getUserLikedSongs() to handle pagination
	 */
	const getBatchLikedSongs = async (accessToken: string, limit: number, offset: number = 0) => {
		try {
			return await $fetch('https://api.spotify.com/v1/me/tracks', {
				query: {
					limit: limit.toString(),
					offset: offset.toString(),
				},
				headers: {
					Authorization: `Bearer ${accessToken}`,
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

	/**
	 * Get ALL of the user's liked songs with automatic pagination
	 * This function handles the complexity of fetching all songs across multiple API calls
	 */
	const getUserLikedSongs = async (token: string) => {
		console.log('📦 Starting to fetch ALL liked songs...')

		const allLikedSongs: any[] = []
		let offset = 0
		const limit = 50 // Maximum allowed by Spotify per request
		let hasMore = true

		while (hasMore) {
			const batch = await getBatchLikedSongs(token, limit, offset)

			if (batch.items && batch.items.length > 0) {
				allLikedSongs.push(...batch.items)

				if (batch.items.length < limit || allLikedSongs.length >= batch.total) {
					hasMore = false
				}
				else {
					offset += limit
				}
			}
			else {
				hasMore = false
			}
		}
		console.log(`Processed ${allLikedSongs.length} liked songs.`)
		return {
			items: allLikedSongs,
			total: allLikedSongs.length,
		}
	}

	/**
	 * Get detailed information for a single artist including genres
	 * @param artistId - Spotify artist ID (e.g., from track.artists[0].id)
	 * @returns Artist object with name, genres, popularity, followers, etc.
	 */
	const getArtistInfo = async (artistId: string) => { // TODO get the artists genre, return a record or object with the artist name and its first genre
		try {
			return await $fetch('/api/spotify/artist-info', {
				query: { id: artistId },
			})
		}
		catch (error: any) {
			if (error.data?.code === 'no_provider_tokens') {
				console.log('🚨 EDGE CASE: Using client-side tokens for getArtistInfo')
				return await makeClientSideSpotifyCall(`/artists/${artistId}`)
			}
			throw error
		}
	}

	/**
	 * Get information for multiple artists in a single efficient API call
	 * This is much more efficient than calling getArtistInfo() multiple times
	 * @param artistIds - Array of Spotify artist IDs (max 50 per Spotify's limit)
	 * @returns Object containing array of artist objects
	 */
	const getMultipleArtistsInfo = async (artistIds: string[], token?: string) => {
		const limitedIds = artistIds.slice(0, 50)

		if (token) {
			// Direct Spotify call (server-side)
			return await $fetch(`https://api.spotify.com/v1/artists?ids=${limitedIds.join(',')}`, {
				headers: {
					'Authorization': `Bearer ${token}`,
					'Content-Type': 'application/json',
				},
			})
		}
		else {
			// Client-side fallback
			return await makeClientSideSpotifyCall(`/artists?ids=${limitedIds.join(',')}`)
		}
	}

	return {
		getUserProfile,
		getUserPlaylists,
		getUserLikedSongs,

		getArtistInfo,
		getMultipleArtistsInfo,
	}
}
