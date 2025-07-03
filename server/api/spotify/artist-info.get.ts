/* eslint-disable @typescript-eslint/no-explicit-any */
import { serverSupabaseSession } from '#supabase/server'

/**
 * Server endpoint to fetch artist information including genres from Spotify.
 * Optimized for the "first artist only" approach - supports both single and batch requests
 * for maximum efficiency when processing liked songs.
 *
 * Query parameters:
 * - Single artist: ?id=artistId
 * - Batch request: ?ids=id1,id2,id3 (up to 50 artists per Spotify's limit)
 */
export default defineEventHandler(async (event) => {
	try {
		const session = await serverSupabaseSession(event)
		const query = getQuery(event)

		// Extract query parameters - support both single and batch requests
		const { id, ids } = query

		// Validate authentication
		if (!session?.provider_token) {
			console.log('🚨 EDGE CASE: No provider tokens available on server')
			throw createError({
				statusCode: 400,
				statusMessage: 'No provider tokens available',
				data: {
					code: 'no_provider_tokens',
					message: 'Provider tokens not available server-side - check client-side tokens',
				},
			})
		}

		// Validate that we have at least one artist ID to fetch
		if (!id && !ids) {
			throw createError({
				statusCode: 400,
				statusMessage: 'Missing required parameter: either "id" for single artist or "ids" for batch request',
				data: {
					code: 'missing_artist_id',
					expectedUsage: {
						single: '/api/spotify/artist-info?id=4UXqAaa6dQYAk18Lv7PEgX',
						batch: '/api/spotify/artist-info?ids=4UXqAaa6dQYAk18Lv7PEgX,0C0XlULifJtAgn6ZNCW2eu',
					},
				},
			})
		}

		// Build the appropriate Spotify API URL based on request type
		let spotifyApiUrl: string
		let requestType: 'single' | 'batch'

		if (ids) {
			// BATCH REQUEST: Multiple artists (more efficient for genre organization)
			const artistIds = (ids as string).split(',').slice(0, 50) // Enforce Spotify's 50-artist limit
			spotifyApiUrl = `https://api.spotify.com/v1/artists?ids=${artistIds.join(',')}`
			requestType = 'batch'
			console.log(`📥 Batch request for ${artistIds.length} artists`)
		}
		else {
			// SINGLE REQUEST: One artist (useful for individual lookups)
			spotifyApiUrl = `https://api.spotify.com/v1/artists/${id}`
			requestType = 'single'
			console.log(`📥 Single request for artist ${id}`)
		}

		// Make the request to Spotify's API
		const response = await fetch(spotifyApiUrl, {
			headers: {
				Authorization: `Bearer ${session.provider_token}`,
			},
		})

		// Handle Spotify API errors
		if (!response.ok) {
			console.error('Spotify artist API error:', response.status, response.statusText)
			throw createError({
				statusCode: response.status,
				statusMessage: `Spotify artist API error: ${response.statusText}`,
				data: {
					code: 'spotify_api_error',
					spotifyStatus: response.status,
					requestType,
					requestedIds: requestType === 'batch' ? (ids as string).split(',') : [id as string],
				},
			})
		}

		const artistData = await response.json()

		// Log success with helpful debugging information
		if (requestType === 'batch') {
			const receivedCount = artistData.artists?.length || 0
			console.log(`✅ Successfully fetched ${receivedCount} artists via server-side tokens`)

			// Log any artists that weren't found (helpful for debugging)
			const requestedIds = (ids as string).split(',')
			const receivedIds = artistData.artists?.map((artist: any) => artist.id) || []
			const missingIds = requestedIds.filter(id => !receivedIds.includes(id))
			if (missingIds.length > 0) {
				console.log(`⚠️  ${missingIds.length} artists not found: ${missingIds.join(', ')}`)
			}
		}
		else {
			console.log(`✅ Successfully fetched artist "${artistData.name}" with ${artistData.genres?.length || 0} genres`)
		}

		return artistData
	}
	catch (error: any) {
		// Re-throw known errors (like createError calls above)
		if (error.statusCode) {
			throw error
		}

		// Handle unexpected errors
		console.error('💥 Unexpected error in artist-info endpoint:', error)
		throw createError({
			statusCode: 500,
			statusMessage: 'Internal server error while fetching artist information',
			data: {
				code: 'server_error',
				originalError: error.message,
			},
		})
	}
})
