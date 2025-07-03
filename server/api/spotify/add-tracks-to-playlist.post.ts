/* eslint-disable @typescript-eslint/no-explicit-any */
import { serverSupabaseSession } from '#supabase/server'

/**
 * Adds tracks to an existing Spotify playlist in batches.
 * Handles Spotify's 100-track-per-request limit automatically.
 *
 * Expected body: {
 *   playlist_id: string,
 *   track_ids: string[], // Array of Spotify track IDs
 * }
 * Returns: {
 *   success: boolean,
 *   tracks_added: number,
 *   total_batches: number,
 *   playlist_id: string
 * }
 */
export default defineEventHandler(async (event) => {
	// Note: No need for assertMethod(event, 'POST') since .post.ts handles this automatically

	try {
		const session = await serverSupabaseSession(event)
		const body = await readBody(event)

		// Validate authentication - we only need the provider token for this operation
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

		// Validate request body structure and content
		const { playlist_id, track_ids } = body

		if (!playlist_id || typeof playlist_id !== 'string') {
			throw createError({
				statusCode: 400,
				statusMessage: 'Missing or invalid playlist_id in request body',
				data: {
					code: 'invalid_request',
					message: 'Request body must contain a valid playlist_id string',
				},
			})
		}

		if (!Array.isArray(track_ids) || track_ids.length === 0) {
			throw createError({
				statusCode: 400,
				statusMessage: 'Missing or invalid track_ids in request body',
				data: {
					code: 'invalid_request',
					message: 'Request body must contain a non-empty array of track_ids',
					expectedFormat: { playlist_id: 'string', track_ids: ['track_id1', 'track_id2'] },
				},
			})
		}

		// Convert track IDs to Spotify URIs format
		// Spotify's add tracks endpoint expects URIs in format: "spotify:track:TRACK_ID"
		const trackUris = track_ids.map(id => `spotify:track:${id}`)

		console.log(`🎵 Adding ${trackUris.length} tracks to playlist ${playlist_id}`)

		// Spotify allows max 100 tracks per request, so we need to batch them
		const batchSize = 100
		const batches = []

		// Split tracks into manageable chunks for Spotify's API
		for (let i = 0; i < trackUris.length; i += batchSize) {
			batches.push(trackUris.slice(i, i + batchSize))
		}

		console.log(`📦 Split into ${batches.length} batches of up to ${batchSize} tracks each`)

		let totalTracksAdded = 0
		let batchNumber = 1

		// Process each batch sequentially to avoid overwhelming Spotify's API
		for (const batch of batches) {
			console.log(`🚀 Processing batch ${batchNumber}/${batches.length} (${batch.length} tracks)`)

			try {
				const addTracksResponse = await fetch(`https://api.spotify.com/v1/playlists/${playlist_id}/tracks`, {
					method: 'POST',
					headers: {
						'Authorization': `Bearer ${session.provider_token}`,
						'Content-Type': 'application/json',
					},
					body: JSON.stringify({
						uris: batch,
					}),
				})

				if (!addTracksResponse.ok) {
					const errorText = await addTracksResponse.text()
					console.error(`❌ Failed to add batch ${batchNumber}:`, addTracksResponse.status, errorText)

					// For batch failures, we continue with other batches but log the error
					// This allows partial success rather than complete failure
					console.log(`⚠️  Skipping failed batch ${batchNumber}, continuing with remaining batches...`)
				}
				else {
					totalTracksAdded += batch.length
					console.log(`✅ Successfully added batch ${batchNumber} (${batch.length} tracks)`)
				}
			}
			catch (batchError) {
				console.error(`❌ Unexpected error in batch ${batchNumber}:`, batchError)
				// Continue with other batches - resilient error handling
			}

			batchNumber++

			// Add a small delay between batches to be respectful to Spotify's API
			// Only add delay if there are more batches to process
			if (batchNumber <= batches.length) {
				await new Promise(resolve => setTimeout(resolve, 200)) // 200ms delay
			}
		}

		// Determine overall success and provide detailed results
		const success = totalTracksAdded > 0
		const allTracksAdded = totalTracksAdded === track_ids.length

		if (allTracksAdded) {
			console.log(`🎉 Successfully added all ${totalTracksAdded} tracks to playlist`)
		}
		else if (success) {
			console.log(`⚠️  Partially successful: added ${totalTracksAdded}/${track_ids.length} tracks`)
		}
		else {
			console.log(`❌ Failed to add any tracks to playlist`)
		}

		return {
			success,
			tracks_added: totalTracksAdded,
			tracks_requested: track_ids.length,
			total_batches: batches.length,
			playlist_id,
			all_tracks_added: allTracksAdded,
		}
	}
	catch (error: any) {
		// Re-throw known errors (like createError calls above)
		if (error.statusCode) {
			throw error
		}

		// Handle unexpected errors gracefully
		console.error('💥 Unexpected error in add-tracks-to-playlist endpoint:', error)
		throw createError({
			statusCode: 500,
			statusMessage: 'Internal server error while adding tracks to playlist',
			data: {
				code: 'server_error',
				originalError: error.message,
			},
		})
	}
})
