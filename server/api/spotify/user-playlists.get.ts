/* eslint-disable @typescript-eslint/no-explicit-any */
import { serverSupabaseSession } from '#supabase/server'

export default defineEventHandler(async (event) => {
	try {
		const session = await serverSupabaseSession(event)

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

		const response = await fetch('https://api.spotify.com/v1/me/playlists?limit=50', {
			headers: {
				Authorization: `Bearer ${session.provider_token}`,
			},
		})

		if (!response.ok) {
			console.error('Spotify API error:', response.status, response.statusText)
			throw createError({
				statusCode: response.status,
				statusMessage: `Spotify API error: ${response.statusText}`,
				data: {
					code: 'spotify_api_error',
					spotifyStatus: response.status,
				},
			})
		}

		const playlistData = await response.json()
		console.log('✅ Successfully fetched user playlists via server-side tokens at', new Date().toISOString())
		return playlistData
	}
	catch (error: any) {
		if (error.statusCode) {
			throw error
		}

		console.error('💥 Unexpected error in user-playlists endpoint:', error)
		throw createError({
			statusCode: 500,
			statusMessage: 'Internal server error',
			data: { code: 'server_error' },
		})
	}
})
