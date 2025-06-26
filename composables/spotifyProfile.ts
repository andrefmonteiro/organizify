import type { Session } from '@supabase/supabase-js'
import type { SpotifyUser } from '~/types/spotify'

export const useSpotifyProfile = () => {
	const spotifyProfile = useState<SpotifyUser | null>('spotify.profile', () => null)

	const fetchSpotifyProfile = async (session?: Session) => {
		try {
			const currSession = session || (await supabase.auth.getSession()).data.session
			if (currSession) {
				console.log('ACTUAL SESSION STRUCTURE: ', JSON.stringify(currSession, null, 2))
			}
			if (!currSession?.provider_token) {
				console.error('No Spotify access token found')
				throw new Error('No Spotify access token found')
			}
			const response = await fetch('https://api.spotify.com/v1/me', {
				headers: {
					Authorization: `Bearer ${currSession.provider_token}`,
				},
			})

			spotifyProfile.value = await response.json()
		}
		catch (error) {
			console.error('Error fetching Spotify profile: ', error)
		}
	}
	return {
		spotifyProfile: readonly(spotifyProfile),
		fetchSpotifyProfile,
	}
}
