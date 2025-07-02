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
			return await $fetch('/api/spotify/user-profile') // fetch vs useFetch vs $fetch?
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

	return {
		getUserProfile,
		getUserPlaylists,
	}
}
