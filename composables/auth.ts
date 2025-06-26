import type { User, Session, AuthChangeEvent } from '@supabase/supabase-js'

export const useAuth = () => {
	// State management
	const isLoggedIn = useState<boolean>('auth.isLoggedIn', () => false)
	const supabaseUser = useState<User | null>('auth.user', () => null)
	const loading = useState<boolean>('auth.loading', () => false)
	const { fetchSpotifyProfile } = useSpotifyProfile()
	const supabase = useSupabase()

	const cleanOAuthTokensFromUrl = (redirectPath?: string) => {
		if (!import.meta.client) return

		const currentUrl = window.location
		const hasTokens = currentUrl.hash.includes('access_token')
			|| currentUrl.hash.includes('refresh_token')
			|| currentUrl.hash.includes('provider_token')

		if (hasTokens) {
			console.log('Cleaning OAuth tokens from URL for security')

			// Replace the current URL with a clean version
			if (redirectPath) {
				// Navigate to a specific path
				window.history.replaceState({}, document.title, redirectPath)
			}
			else {
				// Just clean the current URL by removing the hash
				window.history.replaceState({}, document.title, currentUrl.pathname + currentUrl.search)
			}
		}
	}

	const hasOAuthTokensInUrl = (): boolean => {
		if (!import.meta.client) return false

		const hash = window.location.hash
		return hash.includes('access_token')
			|| hash.includes('refresh_token')
			|| hash.includes('provider_token')
	}

	const extractOAuthError = () => {
		if (!import.meta.client) return null

		const hash = window.location.hash
		if (!hash.includes('error=')) return null

		try {
			const urlParams = new URLSearchParams(hash.substring(1))
			return {
				error: urlParams.get('error'),
				errorCode: urlParams.get('error_code'),
				errorDescription: decodeURIComponent(urlParams.get('error_description') || ''),
			}
		}
		catch (error) {
			console.error('Failed to parse OAuth error from URL:', error)
			return null
		}
	}

	const handleUserSignedIn = async (session: Session) => {
		console.log('User signed in successfully')

		supabaseUser.value = session.user
		isLoggedIn.value = true
		loading.value = true

		setTimeout(async () => {
			try {
				console.log('📡 Fetching Spotify profile...')
				await fetchSpotifyProfile(session)
				console.log('✅ Spotify profile loaded successfully')

				if (import.meta.client && !window.location.pathname.includes('/dashboard')) {
					console.log('🔒 Securing tokens and redirecting to dashboard')
					cleanOAuthTokensFromUrl('/dashboard')
					await navigateTo('/dashboard')
				}
			}
			catch (error) {
				console.error('⚠️ Error fetching Spotify profile:', error)
				if (import.meta.client && !window.location.pathname.includes('/dashboard')) {
					console.log('🔒 Securing tokens despite profile error, redirecting to dashboard')
					cleanOAuthTokensFromUrl('/dashboard')
					await navigateTo('/dashboard')
				}
			}
			finally {
				loading.value = false
			}
		}, 0)
	}

	const handleOAuthError = async () => {
		console.log('❌ Processing OAuth error')

		const errorDetails = extractOAuthError()

		if (errorDetails) {
			console.error('OAuth error details:', errorDetails)
			cleanOAuthTokensFromUrl('/')

			// TODO: Replace this alert with a proper modal component
			alert(`Login failed: ${errorDetails.errorDescription}\n\nClick OK to return to the home page.`)

			await navigateTo('/')
		}
		else {
			console.error('OAuth error detected but could not extract details')
			cleanOAuthTokensFromUrl('/')
			await navigateTo('/')
		}
	}

	supabase.auth.onAuthStateChange(async (event: AuthChangeEvent, session: Session | null) => {
		console.log('🔄 Auth state changed:', event)

		if (event === 'SIGNED_OUT' && import.meta.client && window.location.hash.includes('error=')) {
			await handleOAuthError()
		}
		else if (event === 'INITIAL_SESSION') {
			if (session?.user) {
				console.log('🔄 Restoring existing session')
				await handleUserSignedIn(session)
			}
			else {
				console.log('🔍 No existing session found')
				if (import.meta.client && hasOAuthTokensInUrl()) {
					console.log('🧹 Cleaning stray tokens from URL')
					cleanOAuthTokensFromUrl()
				}
				loading.value = false
			}
		}
		else if (event === 'SIGNED_IN' && session) {
			console.log('🎊 New sign-in detected')
			await handleUserSignedIn(session)
		}
		else if (event === 'SIGNED_OUT') {
			console.log('👋 User signed out')
			supabaseUser.value = null
			isLoggedIn.value = false
			loading.value = false

			if (import.meta.client) {
				await navigateTo('/')
			}
		}
	})

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

			if (error) {
				console.error('❌ Sign out error:', error)
				throw error
			}
			console.log('✅ User signed out successfully')
		}
		catch (error) {
			console.error('💥 Error during sign out:', error)

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
