export const useAuth = () => {
	const isLoggedIn = useState<boolean>('auth.isLoggedIn', () => true)

	const logIn = (): void => {
		isLoggedIn.value = true
	}

	const logOut = (): void => {
		isLoggedIn.value = false
	}

	return {
		isLoggedIn: readonly(isLoggedIn),
		logIn,
		logOut,
	}
}
