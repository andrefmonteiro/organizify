/* eslint-disable @typescript-eslint/no-explicit-any */
import { serverSupabaseSession, serverSupabaseUser } from '#supabase/server'

export default defineEventHandler(async (event) => {
	try {
		const session = await serverSupabaseSession(event)
		const user = await serverSupabaseUser(event)
		const body = await readBody(event)

		// Validate authentication - check both session and user
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

		// Extract the Spotify user ID from the user metadata
		const userId = user?.user_metadata?.sub

		console.log('📋 Spotify user ID from user metadata:', userId)

		if (!userId) {
			throw createError({
				statusCode: 500,
				statusMessage: 'Could not determine user ID from user metadata',
				data: {
					code: 'missing_user_id',
					// Helpful debugging info for development
					availableMetadata: Object.keys(user?.user_metadata || {}),
					hasUser: !!user,
					hasSession: !!session,
				},
			})
		}

		// Validate request body
		const { genreName } = body
		if (!genreName || typeof genreName !== 'string') {
			throw createError({
				statusCode: 400,
				statusMessage: 'Missing or invalid genreName in request body',
				data: {
					code: 'invalid_request',
					message: 'Request body must contain a valid genreName string',
					expectedFormat: { genreName: 'Rock' },
				},
			})
		}

		// Create the playlist with Organizify branding
		const playlistName = `Organizify - ${genreName}`
		const playlistDescription = `${genreName} playlist made by Organizify`

		console.log(`🎵 Creating playlist: "${playlistName}" for user ${userId}`)

		const createPlaylistResponse = await fetch(`https://api.spotify.com/v1/users/${userId}/playlists`, {
			method: 'POST',
			headers: {
				'Authorization': `Bearer ${session.provider_token}`,
				'Content-Type': 'application/json',
			},
			body: JSON.stringify({
				name: playlistName,
				description: playlistDescription,
				collaborative: false,
			}),
		})

		if (!createPlaylistResponse.ok) {
			const errorText = await createPlaylistResponse.text()
			console.error('Spotify playlist creation error:', createPlaylistResponse.status, errorText)
			throw createError({
				statusCode: createPlaylistResponse.status,
				statusMessage: `Spotify playlist creation failed: ${createPlaylistResponse.statusText}`,
				data: {
					code: 'spotify_playlist_creation_error',
					spotifyStatus: createPlaylistResponse.status,
					details: errorText,
				},
			})
		}

		const playlistData = await createPlaylistResponse.json()

		console.log(`✅ Successfully created playlist "${playlistName}" with ID: ${playlistData.id}`)

		// Return essential playlist information for the client
		return {
			playlistId: playlistData.id,
			name: playlistData.name,
			description: playlistData.description,
			externalUrl: playlistData.external_urls?.spotify,
			trackCount: 0,
			public: playlistData.public,
		}
	}
	catch (error: any) {
		// Re-throw known errors (like createError calls above)
		if (error.statusCode) {
			throw error
		}

		// Handle unexpected errors
		console.error('💥 Unexpected error in create-playlist endpoint:', error)
		throw createError({
			statusCode: 500,
			statusMessage: 'Internal server error while creating playlist',
			data: {
				code: 'server_error',
				originalError: error.message,
			},
		})
	}
})
