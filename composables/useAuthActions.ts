export const useAuthActions = () => {
	const user = useSupabaseUser()
	const supabase = useSupabaseClient()

	const signInWithSpotify = async () => {
		try {
			console.log('Initiating Spotify OAuth from: ', document.location.pathname)
			const { error } = await supabase.auth.signInWithOAuth({
				provider: 'spotify',
				options: {
					redirectTo: `${window.location.origin}/confirm`,
					scopes: 'user-read-private user-read-email playlist-read-private playlist-modify-private playlist-modify-public',
				},
			})
			if (error) {
				console.error('❌ OAuth initiation failed', error)
				throw error
			}
		} // isn't the if (error) and the catch (error) redundant? or are they 2 types of error?
		catch (error) {
			console.error('💥 Unexpected error during login: ', error)
			throw error
		}
	}

	const signOut = async () => {
		try {
			console.log('👋 Signing out')
			const { error } = await supabase.auth.signOut()
			if (error) {
				console.error('Error signining out: ', error)
				throw error
			}
			console.log('✅ Sign out successful')
		}
		catch (error) {
			console.error('Unexpected sign out error: ', error)
			throw error
		}
	}

	const isAuthenticated = computed(() => !!user.value)

	return {
		user: readonly(user),
		isAuthenticated: readonly(isAuthenticated),

		signInWithSpotify,
		signOut,
	}
}
