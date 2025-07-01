/* eslint-disable @typescript-eslint/no-explicit-any */

/**
 * Extended interface for Spotify-specific user identity data.
 * This extends the base UserIdentity type to include OAuth token properties
 * that Spotify provides but aren't part of Supabase's generic identity type.
 */
interface SpotifyIdentityData {
	access_token?: string
	refresh_token?: string
	provider_token?: string
	// Allow other properties that Spotify might include
	[key: string]: any
}

/**
 * Extended interface for a Spotify user identity.
 * This combines Supabase's UserIdentity with Spotify-specific properties.
 */
interface SpotifyUserIdentity {
	identity_id: string
	user_id: string
	provider: 'spotify'
	identity_data?: SpotifyIdentityData
	// Include potential token properties at the root level too
	access_token?: string
	refresh_token?: string
	// Allow other properties while maintaining type safety for known ones
	[key: string]: any
}

export const useSpotifyPermissions = () => {
	const user = useSupabaseUser()
	const sessionValidated = ref<boolean>(false)
	const hasValidPermissions = ref<boolean>(true)

	/**
	 * Helper function to extract Spotify OAuth tokens from Supabase user identity data.
	 * Supabase stores OAuth tokens in the identity object rather than user_metadata,
	 * and we need to check multiple possible locations since different providers
	 * and configurations might store them differently.
	 */
	const getSpotifyTokens = () => {
		const session = useSupabaseSession()
		const user = useSupabaseUser()

		// First, try to get tokens from the session object (most reliable)
		if (session.value?.provider_token) {
			console.log('🎯 Found Spotify tokens in session object')
			return {
				accessToken: session.value.provider_token,
				refreshToken: session.value.provider_refresh_token || null,
			}
		}

		// Fallback: look in user identity data (as we were doing before)
		if (!user.value?.identities) {
			return { accessToken: null, refreshToken: null }
		}

		const spotifyIdentity = user.value.identities.find(
			identity => identity.provider === 'spotify',
		) as SpotifyUserIdentity | undefined

		if (!spotifyIdentity) {
			return { accessToken: null, refreshToken: null }
		}

		const identityData: SpotifyIdentityData = spotifyIdentity.identity_data || {}

		const accessToken = identityData.access_token
			|| spotifyIdentity.access_token
			|| identityData.provider_token
			|| null

		const refreshToken = identityData.refresh_token
			|| spotifyIdentity.refresh_token
			|| null

		console.log('🔍 Found tokens from identity data:', {
			hasAccessToken: !!accessToken,
			hasRefreshToken: !!refreshToken,
			accessTokenLength: accessToken?.length || 0,
		})

		return { accessToken, refreshToken }
	}

	/**
	 * Test function to explore where Spotify OAuth tokens might be stored
	 * in the Nuxt Supabase module's architecture. This helps us understand
	 * how the module separates session and user data.
	 */
	const testActualTokenAccess = () => {
		const session = useSupabaseSession()
		const currentUser = useSupabaseUser()

		console.log('🧪 Testing actual session contents...')
		console.log('Session value:', session.value)
		console.log('User value:', currentUser.value)

		// Test different possible locations for Spotify tokens in session
		const possibleSessionTokens = {
			providerToken: session.value?.provider_token,
			providerRefreshToken: session.value?.provider_refresh_token,
			// Sometimes OAuth tokens are at the root level of session
			accessToken: session.value?.access_token,
			refreshToken: session.value?.refresh_token,
		}

		// Test different possible locations for Spotify tokens in user
		const possibleUserTokens = {
			// Sometimes they're in user metadata
			userProviderToken: currentUser.value?.user_metadata?.provider_token,
			userAccessToken: currentUser.value?.user_metadata?.access_token,
			// Or in app metadata
			appProviderToken: currentUser.value?.app_metadata?.provider_token,
			appAccessToken: currentUser.value?.app_metadata?.access_token,
		}

		console.log('🔍 Possible session token locations:', possibleSessionTokens)
		console.log('🔍 Possible user token locations:', possibleUserTokens)

		// Find the first available token from either location
		const sessionToken = Object.values(possibleSessionTokens).find(token => token)
		const userToken = Object.values(possibleUserTokens).find(token => token)

		console.log('🎯 Found token in session:', !!sessionToken)
		console.log('🎯 Found token in user:', !!userToken)

		return sessionToken || userToken
	}

	/**
	 * Comprehensive inspection of both session and user objects to understand
	 * how the Nuxt Supabase module structures authentication data.
	 */
	const inspectSupabaseSession = () => {
		const session = useSupabaseSession()
		const currentUser = useSupabaseUser()

		console.log('🔍 Complete session object:', session.value)
		console.log('🔍 Complete user object:', currentUser.value)

		if (session.value) {
			console.log('🔍 Session structure:', {
				hasAccessToken: !!session.value.access_token,
				hasRefreshToken: !!session.value.refresh_token,
				hasProviderToken: !!session.value.provider_token,
				hasProviderRefreshToken: !!session.value.provider_refresh_token,
			})

			// Check all properties available in session
			console.log('🔍 All session properties:', Object.keys(session.value))
		}

		if (currentUser.value) {
			console.log('🔍 User structure:', {
				id: currentUser.value.id,
				hasUserMetadata: !!currentUser.value.user_metadata,
				hasAppMetadata: !!currentUser.value.app_metadata,
				hasIdentities: !!currentUser.value.identities,
			})

			// Check all properties available in user
			console.log('🔍 All user properties:', Object.keys(currentUser.value))
		}
	}

	/**
	 * Debug function to inspect the complete user object structure.
	 * This helps understand how Supabase stores OAuth data and troubleshoot
	 * authentication issues by revealing the actual data structure.
	 */
	const debugUserData = () => {
		const currentUser = useSupabaseUser()
		console.log('🔍 Full user object:', currentUser.value)
		console.log('🔍 User metadata:', currentUser.value?.user_metadata)
		console.log('🔍 App metadata:', currentUser.value?.app_metadata)
		console.log('🔍 Identities:', currentUser.value?.identities)

		// Examine the Spotify identity in detail if it exists
		if (currentUser.value?.identities && currentUser.value.identities.length > 0) {
			const spotifyIdentity = currentUser.value.identities.find(id => id.provider === 'spotify')
			console.log('🔍 Spotify identity:', spotifyIdentity)
			console.log('🔍 Identity data:', spotifyIdentity?.identity_data)
			console.log('🔍 Last sign in data:', spotifyIdentity?.last_sign_in_at)
			console.log('🔍 All identity properties:', Object.keys(spotifyIdentity || {}))
		}
	}

	/**
	 * Validates that the user's Spotify access token is still valid by making
	 * a test API call to Spotify's /me endpoint. This function handles the
	 * core logic for determining if the user needs to reconnect their account.
	 */
	const validateSessionPermissions = async () => {
		// Skip validation if already validated or user not logged in
		if (sessionValidated.value || !user.value) return hasValidPermissions.value

		// Use our helper function to get tokens from the correct location
		const { accessToken } = getSpotifyTokens()

		// If no access token found, mark permissions as invalid
		if (!accessToken) {
			console.warn('No access token available')
			hasValidPermissions.value = false
			sessionValidated.value = true
			return hasValidPermissions.value
		}

		try {
			// Test the token by calling Spotify's user profile endpoint
			const response = await fetch('https://api.spotify.com/v1/me', {
				headers: {
					Authorization: `Bearer ${accessToken}`,
				},
			})

			if (response.ok) {
				// Token is valid - mark permissions as good
				hasValidPermissions.value = true
				sessionValidated.value = true
				console.log('Spotify permissions validated for session')
			}
			else if (response.status === 401) {
				// Token expired or revoked - handle unauthorized error
				handle401Error()
			}
			else {
				// Other error status - log for debugging but don't mark as invalid yet
				console.warn('Permission validation failed with status:', response.status)
			}
		}
		catch (error) {
			console.error('Permission validation error:', error)
			// Network or other errors don't necessarily mean invalid permissions
			// So we don't automatically mark as invalid here
		}

		return hasValidPermissions.value
	}

	/**
	 * Handles the case when Spotify returns a 401 Unauthorized response.
	 * This typically means the access token has expired or been revoked.
	 * Sets the permission state to trigger the UI to show reconnection options.
	 */
	const handle401Error = () => {
		console.log('Detected 401 error - marking permissions as invalid')
		hasValidPermissions.value = false
		sessionValidated.value = true
	}

	/**
	 * Test function to artificially corrupt the access token for testing
	 * token expiration handling without waiting for natural expiration.
	 * This helps verify that error handling works correctly.
	 */
	const testTokenRefresh = () => {
		const session = useSupabaseSession()

		if (session.value?.provider_token) {
			// Corrupt the provider token in the session object
			const originalToken = session.value.provider_token
			session.value.provider_token += 'INVALID'
			console.log('🧪 Testing: Provider token corrupted to simulate expiration')
			console.log(`Original token length: ${originalToken.length}`)
			console.log(`Corrupted token length: ${session.value.provider_token.length}`)

			// Reset session validation so the corruption will be tested
			sessionValidated.value = false

			return true // Indicates corruption was successful
		}
		else {
			console.log('❌ No provider token found in session to corrupt')
			return false
		}
	}

	/**
	 * React to user changes by resetting validation state.
	 * This ensures that when a user logs out and back in,
	 * we re-validate their permissions fresh.
	 */
	watch(user, () => {
		sessionValidated.value = false
		hasValidPermissions.value = false
	})

	// Return the public interface of this composable
	return {
		hasValidPermissions: readonly(hasValidPermissions),
		validateSessionPermissions,
		handle401Error,
		testTokenRefresh,
		debugUserData,
		testActualTokenAccess,
		inspectSupabaseSession,
	}
}
