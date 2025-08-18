/* eslint-disable @typescript-eslint/no-explicit-any */
import { serverSupabaseSession } from '#supabase/server'

export default defineEventHandler(async (event) => {
	try {
		const session = await serverSupabaseSession(event)

		// Get query parameters for pagination
		const query = getQuery(event)
		const { limit = '50', offset = '0' } = query

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

		const likedSongsUrl = new URL('https://api.spotify.com/v1/me/tracks')
		likedSongsUrl.searchParams.set('limit', limit as string)
		likedSongsUrl.searchParams.set('offset', offset as string)

		const response = await fetch(likedSongsUrl.toString(), {
			headers: {
				Authorization: `Bearer ${session.provider_token}`,
			},
		})

		if (!response.ok) {
			console.error('Spotify liked songs API error:', response.status, response.statusText)
			throw createError({
				statusCode: response.status,
				statusMessage: `Spotify liked songs API error: ${response.statusText}`,
				data: {
					code: 'spotify_api_error',
					spotifyStatus: response.status,
				},
			})
		}

		const likedSongsData = await response.json()
		console.log('✅ Successfully fetched user liked songs via server-side tokens at', new Date().toISOString())
		return likedSongsData
	}
	catch (error: any) {
		if (error.statusCode) {
			throw error
		}

		console.error('💥 Unexpected error in user-liked-songs endpoint:', error)
		throw createError({
			statusCode: 500,
			statusMessage: 'Internal server error',
			data: { code: 'server_error' },
		})
	}
})
