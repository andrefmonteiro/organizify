export const useAuth = () => {
	const isLoggedIn = useState('auth.isLoggedIn', () => false)
	const logIn = () => isLoggedIn.value = true
	const logOut = () => isLoggedIn.value = false

	return {
		isLoggedIn: readonly(isLoggedIn),
		logIn,
		logOut,
	}
}
