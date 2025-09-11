export const useSpotifyPermissions = () => {
	const user = useSupabaseUser()
	const session = useSupabaseSession()

	const hasValidPermissions = computed(() => {
		return !!(user.value && session.value?.provider_token)
	})

	const validateSessionPermissions = async (): Promise<boolean> => {
		return hasValidPermissions.value
	}

	return {
		hasValidPermissions: readonly(hasValidPermissions),
		validateSessionPermissions,
	}
}
