/* eslint-disable @typescript-eslint/no-explicit-any */
/**
 * Composable for managing Spotify authentication permissions and token validation.
 * Handles checking if the user's Spotify access token is still valid and provides
 * utilities for token retrieval and permission state management.
 */
export const useSpotifyPermissions = () => {
	const user = useSupabaseUser()
	const sessionValidated = ref<boolean>(false)
	const hasValidPermissions = ref<boolean>(true)
	/**
	* Used only as a fallback when server-side tokens aren't available.
	* The primary token access should be through server endpoints that use serverSupabaseSession().
	*/
	const getClientSideSpotifyTokens = () => {
		const session = useSupabaseSession()
		if (session.value?.provider_token) {
			return {
				accessToken: session.value.provider_token,
				refreshToken: session.value.provider_refresh_token || null,
			}
		}
		return { accessToken: null, refreshToken: null }
	}
	/**
	 * Validates that the user's Spotify access token is still valid by making
	 * a test API call to Spotify's /me endpoint. This function handles the
	 * core logic for determining if the user needs to reconnect their account.
	 *
	 * @returns Promise<boolean> - True if permissions are valid, false otherwise
	 */
	const validateSessionPermissions = async () => {
		if (sessionValidated.value || !user.value) return hasValidPermissions.value

		try {
			const { getUserProfile } = useSpotifyApi()
			await getUserProfile()

			hasValidPermissions.value = true
			sessionValidated.value = true
			console.log('✅ Spotify permissions validated')
		}
		catch (error: any) {
			console.error('Permission validation error:', error)
			if (error.status === 401 || error.message?.includes('401')) {
				handle401Error()
			}
		}
		return hasValidPermissions.value
	}

	const handle401Error = () => {
		console.log('Detected 401 error - marking permissions as invalid')
		hasValidPermissions.value = false
		sessionValidated.value = true
	}

	watch(user, () => {
		sessionValidated.value = false
		hasValidPermissions.value = false
	})

	return {
		hasValidPermissions: readonly(hasValidPermissions),
		validateSessionPermissions,
		handle401Error,
		getClientSideSpotifyTokens,
	}
}
