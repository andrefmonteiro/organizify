export default defineNuxtRouteMiddleware(() => {
	const { isLoggedIn, user } = useAuth()

	console.log('MIDDLEWARE CHECK:', {
		isLoggedIn: isLoggedIn.value,
		hasUser: !!user.value,
	})

	if (!isLoggedIn.value) {
		console.log('MIDDLEWARE: Redirecting to home - not logged in')
		return navigateTo('/')
	}
})
