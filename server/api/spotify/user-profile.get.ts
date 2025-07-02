/* eslint-disable @typescript-eslint/no-explicit-any */
import { serverSupabaseSession } from '#supabase/server' // error: Cannot find module '#supabase/server' or its corresponding type declarations.ts(2307)

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
		const response = await fetch('https://api.spotify.com/v1/me', {
			headers: {
				Authorization: `Bearer ${session.provider_token}`,
			},
		})
		if (!response.ok) {
			console.error('Spotify API error: ', response.status, response.statusText)
			throw createError({
				statusCode: response.status,
				statusMessage: `Spotify API error: ${response.statusText}`,
				data: {
					code: 'spotify_api_error',
					spotifyStatus: response.status,
				},
			})
		}

		const userData = await response.json()
		console.log('✅ Successfully fetched user profile via server-side tokens at', new Date().toISOString())
		return userData
	}
	catch (error: any) {
		if (error.statusCode) {
			throw error
		}
		console.error('Unexpected error in user-profile endpoint: ', error)
		throw createError({
			statusCode: 500,
			statusMessage: 'Internal server error',
			data: { code: 'server_error' },
		})
	}
})
