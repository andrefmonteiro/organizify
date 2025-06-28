import { useSpotifyPermissions } from '~/composables/useSpotifyPermissions'

export default defineNuxtRouteMiddleware(async () => {
	try {
		const { validateSessionPermissions } = useSpotifyPermissions()
		console.log('Checking Spotify permissions for protected route')

		await validateSessionPermissions()
	}
	catch (error) {
		console.error('Error during permission validation', error)
	}
})
