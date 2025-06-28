export const useSpotifyPermissions = () => {
	const user = useSupabaseUser()
	const sessionValidated = ref(false)
	const permissionStatus = ref<'unknown' | 'valid' | 'invalid'>('unknown')

	const validateSessionPermissions = async () => {
		if (sessionValidated.value || !user.value) return permissionStatus.value

		const accessToken = user.value?.user_metadata?.access_token
		if (!accessToken) {
			console.warn('No access token available')
			permissionStatus.value = 'invalid'
			sessionValidated.value = true
			return permissionStatus.value
		}
		try {
			const response = await fetch('https://api.spotify.com/v1/me', {
				headers: {
					Authorization: `Bearer ${accessToken}`,
				},
			})
			if (response.ok) {
				permissionStatus.value = 'valid'
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
		return permissionStatus.value
	}

	const handle401Error = () => {
		console.log('Detected 401 error - marking permissions as invalid')
		permissionStatus.value = 'invalid'
		sessionValidated.value = true
	}

	watch(user, () => {
		sessionValidated.value = false
		permissionStatus.value = 'unknown'
	})

	return {
		permissionStatus: readonly(permissionStatus),
		validateSessionPermissions,
		handle401Error,
	}
}
