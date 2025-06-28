export const useSpotifyPermissions = () => {
	const user = useSupabaseUser()
	const sessionValidated = ref<boolean>(false)
	const hasValidPermissions = ref<boolean>(true)

	const validateSessionPermissions = async () => {
		if (sessionValidated.value || !user.value) return hasValidPermissions.value

		const accessToken = user.value?.user_metadata?.access_token
		if (!accessToken) {
			console.warn('No access token available')
			hasValidPermissions.value = false
			sessionValidated.value = true
			return hasValidPermissions.value
		}
		try {
			const response = await fetch('https://api.spotify.com/v1/me', {
				headers: {
					Authorization: `Bearer ${accessToken}`,
				},
			})
			if (response.ok) {
				hasValidPermissions.value = true
				sessionValidated.value = true
				console.log('Spotify permissions validated for session')
			}
			else if (response.status === 401) {
				handle401Error()
			}
			else {
				console.warn('Permission validated failed with status: ', response.status)
			}
		}
		catch (error) {
			console.error('Permission validation error: ', error)
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
	}
}
