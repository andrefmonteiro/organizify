export default defineNuxtRouteMiddleware((to) => {
	const { isLoggedIn, loading } = useAuth()

	if (loading.value) {
		console.log('⏳ Authentication still loading...')
		return
	}

	console.log('🛡️ Auth middleware running for route:', to.path)
	console.log('👤 User logged in:', isLoggedIn.value)
	console.log('📦 Route meta:', to.meta)

	const isOAuthCallback = to.hash?.includes('access_token')
		|| to.hash?.includes('provider_token')
		|| to.hash?.includes('error=')

	if (isOAuthCallback) {
		console.log('🔗 OAuth callback detected')

		if (to.hash.includes('error=')) {
			console.log('❌ OAuth error detecting, redirecting to home')
			return navigateTo('/')
		}
		else {
			console.log('✅ OAuth successful, redirecting to dashboard')
			return navigateTo('/dashboard')
		}
	}

	const requiresAuth = to.meta.requiresAuth
	const redirectIfAuthenticated = to.meta.redirectIfAuthenticated

	if (requiresAuth && !isLoggedIn.value) {
		console.log('🚫 Protected page accesed without authentication')
		console.log('🚦 Redirecting to home page')
		return navigateTo('/')
	}
	if (redirectIfAuthenticated && isLoggedIn.value) {
		console.log('✅ User already authenticated')
		console.log('🏠 Redirecting to dashboard')
		return navigateTo('/dashboard')
	}
})
