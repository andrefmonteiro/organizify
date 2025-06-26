// import type { SpotifyUser } from '~/types/spotify'

export const useSpotifyProfile = () => {
	const user = useSupabaseUser()

	watch(user, (newUser) => {
		if (newUser) {
			console.log('Complete user object: ', newUser)
			console.log('User metadata from Spotify: ', newUser.user_metadata)
		}
	}, { immediate: true })
}
