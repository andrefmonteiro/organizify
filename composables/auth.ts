import { type User, type Session, type AuthChangeEvent, createClient } from '@supabase/supabase-js'

export const useAuth = () => {
	const isLoggedIn = useState<boolean>('auth.isLoggedIn', () => false)
	const supabaseUser = useState<User | null>('auth.user', () => null)
	const loading = useState<boolean>('auth.loading', () => false)
	const { fetchSpotifyProfile } = useSpotifyProfile()

	const config = useRuntimeConfig()
	const supabase = createClient(
		config.public.supabaseUrl,
		config.public.supabaseKey,
	)

	const handleUserSignedIn = (session: Session) => {
		supabaseUser.value = session.user
		isLoggedIn.value = true

		setTimeout(async () => {
			loading.value = true
			try {
				await fetchSpotifyProfile(session)
			}
			catch (error) {
				console.error('Error fetching Spotify profile: ', error)
			}
			finally {
				loading.value = false
			}
		}, 0)
	}

	supabase.auth.onAuthStateChange((event: AuthChangeEvent, session: Session | null) => {
		console.log('AUTH EVENT: ', event, session)
		console.log('SESSION: ', JSON.stringify(session, null, 2))

		if (event === 'INITIAL_SESSION') {
			if (session?.user) {
				console.log('INITIAL SESSION FOUND: ', JSON.stringify(session, null, 2))
				handleUserSignedIn(session)
			}
			else {
				console.log('NO INITIAL SESSION')
			}
		}
		else if (event === 'SIGNED_IN' && session) {
			handleUserSignedIn(session)
		}
		else if (event === 'SIGNED_OUT') {
			supabaseUser.value = null
			isLoggedIn.value = false
			loading.value = false
		}
	})

	const signInWithSpotify = async () => {
		try {
			await supabase.auth.signInWithOAuth({
				provider: 'spotify',
				options: {
					redirectTo: `${window.location.origin}/dashboard`,
					scopes: 'user-read-private user-read-email playlist-read-private playlist-modify-private playlist-modify-public playlist-read-collaborative',
				},
			})
		}
		catch (error) {
			console.error('Error signing in: ', error)
			throw error
		}
	}

	const signOut = async () => {
		try {
			await supabase.auth.signOut()
		}
		catch (error) {
			console.error('Error signing out: ', error)
		}
	}

	return {
		isLoggedIn: readonly(isLoggedIn),
		signInWithSpotify,
		signOut,
		user: supabaseUser,
		loading,
	}
}
