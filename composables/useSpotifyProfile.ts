import type { SpotifyProfileMetadata } from '~/types/spotify'

export const useSpotifyProfile = () => {
	const user = useSupabaseUser()

	const profileMetadata = computed<SpotifyProfileMetadata | null>(() => {
		if (!user.value?.user_metadata) return null

		return user.value.user_metadata as SpotifyProfileMetadata
	})

	const displayName = computed(() => {
		return profileMetadata.value?.full_name || ''
	})
	const avatarUrl = computed(() => {
		return profileMetadata.value?.avatar_url || null
	})
	const isProfileLoaded = computed(() => {
		return !!profileMetadata.value && !!displayName.value
	})

	watch(user, (newUser) => {
		if (newUser?.user_metadata) {
			console.log('🎵 Simple profile loaded:')
			console.log('  Display name:', displayName.value)
			console.log('  Avatar URL:', avatarUrl.value)
		}
	}, { immediate: true })

	return {
		profileMetadata: readonly(profileMetadata),
		displayName: readonly(displayName),
		avatarUrl: readonly(avatarUrl),
		isProfileLoaded: readonly(isProfileLoaded),
	}
}
