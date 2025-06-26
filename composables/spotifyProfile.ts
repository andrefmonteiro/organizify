export const useSpotifyProfile = () => {
	const spotifyProfile = useState('spotify.profile', () => null)

	const fetchSpotifyProfile = async () => {
		try {
			const { data: { session } } = await supabase.auth.getSession()
			if (session) {
				console.log('ACTUAL SESSION STRUCTURE: ', JSON.stringify(session, null, 2))
			}
			if (!session?.provider_token) {
				console.error('No Spotify access token found')
				throw new Error('No Spotify access token found')
			}
			const response = await fetch('https://api.spotify.com/v1/me', {
				headers: {
					Authorization: `Bearer ${session.provider_token}`,
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
