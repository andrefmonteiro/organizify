import type { User, Session, AuthChangeEvent } from '@supabase/supabase-js'

export const useAuth = () => {
	const isLoggedIn = useState<boolean>('auth.isLoggedIn', () => false)
	const supabaseUser = useState<User | null>('auth.user', () => null)
	const loading = useState<boolean>('auth.loading', () => false)
	const { fetchSpotifyProfile } = useSpotifyProfile()
	const supabase = useSupabase()

	const cleanOAuthTokensFromUrl = async () => {
		if (!import.meta.client) return

		const route = useRoute()

		const hasTokens = route.hash.includes('access_token')
			|| route.hash.includes('refresh_token')
			|| route.hash.includes('provider_token')

		if (hasTokens) {
			console.log('🧹 Cleaning OAuth tokens from URL for security')

			await navigateTo({
				path: route.path,
				query: route.query,
				// Note: We omit the hash, which effectively removes the tokens
			}, {
				replace: true, // This replaces the current history entry instead of adding a new one
			})
		}
	}

	const handleUserSignedIn = async (session: Session) => {
		console.log('🎉 User signed in successfully')

		supabaseUser.value = session.user
		isLoggedIn.value = true
		loading.value = true

		try {
			console.log('📡 Fetching Spotify profile...')
			await fetchSpotifyProfile(session)
			console.log('✅ Spotify profile loaded')
		}
		catch (error) {
			console.error('⚠️ Error fetching Spotify profile:', error)
		}
		finally {
			if (import.meta.client) cleanOAuthTokensFromUrl()
			loading.value = false
		}
	}

	supabase.auth.onAuthStateChange(async (event: AuthChangeEvent, session: Session | null) => {
		console.log('🔄 Auth state changed:', event)

		switch (event) {
			case 'INITIAL_SESSION':
				if (session?.user) {
					console.log('🔄 Restoring existing session')
					await handleUserSignedIn(session)
				}
				else {
					console.log('🔍 No existing session found')
					loading.value = false
				}
				break
			case 'SIGNED_IN':
				if (session) {
					console.log('🎊 New sign-in detected')
					await handleUserSignedIn(session!)
				}
				break
			case 'SIGNED_OUT':
				console.log('👋 User signed out')
				supabaseUser.value = null
				isLoggedIn.value = false
				loading.value = false
				break
			default:
				console.log('🤷 Unhandled auth event:', event)
				break
		}
	},
	)

	const signInWithSpotify = async () => {
		try {
			console.log('🎵 Starting Spotify OAuth...')

			if (import.meta.client) {
				cleanOAuthTokensFromUrl()
			}

			const { error } = await supabase.auth.signInWithOAuth({
				provider: 'spotify',
				options: {
					scopes: 'user-read-private user-read-email playlist-read-private playlist-modify-private playlist-modify-public',
				},
			})

			if (error) {
				console.error('❌ Failed to initiate OAuth:', error)
				throw error
			}
		}
		catch (error) {
			console.error('💥 OAuth initiation error:', error)
			throw error
		}
	}

	const signOut = async () => {
		try {
			console.log('👋 Signing out user...')
			const { error } = await supabase.auth.signOut()

			if (error) throw error

			console.log('✅ User signed out successfully')
		}
		catch (error) {
			console.error('❌ Sign out error:', error)

			supabaseUser.value = null
			isLoggedIn.value = false
			loading.value = false
		}
	}

	return {
		isLoggedIn: readonly(isLoggedIn),
		user: readonly(supabaseUser),
		loading: readonly(loading),

		signInWithSpotify,
		signOut,
	}
}
