/* eslint-disable @typescript-eslint/no-explicit-any */

export const useSpotifyApi = () => {
	const makeSpotifyCall = async (
		endpoint: string,
		token: string,
		options: RequestInit = {},
	): Promise<any> => {
		const response = await fetch(`https://api.spotify.com/v1${endpoint}`, {
			...options,
			headers: {
				'Authorization': `Bearer ${token}`,
				'Content-Type': 'application/json',
				...options.headers,
			},
		})

		if (!response.ok) {
			console.error(`Spotify API error: ${response.status} ${response.statusText}`)
			throw new Error(`Spotify API error: ${response.status} ${response.statusText}`)
		}

		return await response.json()
	}

	const getUserProfile = async (token: string) => {
		return await makeSpotifyCall('/me', token)
	}

	const getUserPlaylists = async (token: string, limit: number = 50, offset: number = 0) => { // maybe we dont need this
		return await makeSpotifyCall(`/me/playlists?limit=${limit}&offset=${offset}`, token)
	}

	const getBatchLikedSongs = async (token: string, limit: number, offset: number = 0) => {
		return await makeSpotifyCall(`/me/tracks?limit=${limit}&offset=${offset}`, token)
	}

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

		console.log(`✅ Fetched ${allLikedSongs.length} liked songs total`)
		return {
			items: allLikedSongs,
			total: allLikedSongs.length,
		}
	}

	const getMultipleArtistsInfo = async (artistIds: string[], token: string) => {
		const limitedIds = artistIds.slice(0, 50) // Spotify's max limit
		const idsParam = limitedIds.join(',')

		return await makeSpotifyCall(`/artists?ids=${idsParam}`, token)
	}

	const getArtistInfo = async (artistId: string, token: string) => {
		return await makeSpotifyCall(`/artists/${artistId}`, token)
	}

	const createPlaylist = async (
		userId: string,
		name: string,
		description: string = '',
		isPublic: boolean = false,
		token: string,
	) => {
		return await makeSpotifyCall(`/users/${userId}/playlists`, token, {
			method: 'POST',
			body: JSON.stringify({
				name,
				description,
				public: isPublic,
				collaborative: false,
			}),
		})
	}

	const addTracksToPlaylist = async (
		playlistId: string,
		trackIds: string[],
		token: string,
	) => {
		if (trackIds.length === 0) {
			return { tracksAdded: 0, batches: 0 }
		}

		// Convert track IDs to Spotify URIs format
		const trackUris = trackIds.map(id => `spotify:track:${id}`)

		// Spotify allows max 100 tracks per request
		const batchSize = 100
		let tracksAdded = 0
		let batches = 0

		for (let i = 0; i < trackUris.length; i += batchSize) {
			const batch = trackUris.slice(i, i + batchSize)

			try {
				await makeSpotifyCall(`/playlists/${playlistId}/tracks`, token, {
					method: 'POST',
					body: JSON.stringify({ uris: batch }),
				})

				tracksAdded += batch.length
				batches++
				console.log(`✅ Added batch ${batches}: ${batch.length} tracks to playlist`)
			}
			catch (error) {
				console.error(`❌ Failed to add batch ${batches + 1} to playlist:`, error)
			}
		}

		return { tracksAdded, batches, totalRequested: trackIds.length }
	}

	return {

		getUserProfile,
		getUserPlaylists,
		getUserLikedSongs,

		getArtistInfo,
		getMultipleArtistsInfo,

		createPlaylist,
		addTracksToPlaylist,
	}
}
