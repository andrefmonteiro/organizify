<script setup>
const user = useSupabaseUser()
const route = useRoute()

const oAuthError = computed(() => {
	return route.query.error || route.query.error_description
})

onMounted(() => {
	console.log('OAuth callback page loaded')
	console.log('Current route query: ', route.query)

	if (oAuthError.value) {
		console.error('❌ OAuth error detected: ', oAuthError.value)
		return
	}
	console.log('Callback looks successful, waiting for user state')
})

watch(user, (newUser) => {
	if (newUser) {
		console.log('🎉 Authentication completed successfully!')
		console.log('👤 Authenticated user:', newUser.user_metadata?.full_name)
	}
	// The user is now authenticated, redirect them to dashboard
	// We use a small delay to ensure all auth processing is complete
	setTimeout(() => {
		navigateTo('/dashboard')
	}, 500)
}, { immediate: true })

onMounted(() => {
	setTimeout(() => {
		if (!user.value && !oAuthError.value) {
			console.error('⏰ Authentication timeout - redirecting to home')
			navigateTo('/')
		}
	}, 10000)
})
</script>

<template>
	<div class="min-h-screen flex items-center justify-center bg-background">
		<div class="text-center space-y-6 max-w-md mx-auto p-6">
			<div
				v-if="oauthError"
				class="space-y-4"
			>
				<div class="w-16 h-16 mx-auto bg-destructive/10 rounded-full flex items-center justify-center">
					<svg
						class="w-8 h-8 text-destructive"
						fill="none"
						stroke="currentColor"
						viewBox="0 0 24 24"
					>
						<path
							stroke-linecap="round"
							stroke-linejoin="round"
							stroke-width="2"
							d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
						/>
					</svg>
				</div>
				<div>
					<h2 class="text-2xl font-semibold text-destructive">
						Login Failed
					</h2>
					<p class="text-muted-foreground mt-2">
						{{ oauthError }}
					</p>
				</div>
				<Button
					class="mt-4"
					@click="navigateTo('/')"
				>
					Return to Home
				</Button>
			</div>

			<div
				v-else
				class="space-y-4"
			>
				<div class="w-16 h-16 mx-auto">
					<div class="animate-spin rounded-full h-16 w-16 border-b-2 border-primary" />
				</div>

				<div class="space-y-2">
					<h2 class="text-2xl font-semibold">
						Completing Login...
					</h2>
					<p class="text-muted-foreground">
						Please wait while we connect your Spotify account.
					</p>
				</div>

				<div
					v-if="user"
					class="text-sm text-muted-foreground"
				>
					Welcome, {{ user.user_metadata?.full_name }}! Redirecting to your dashboard...
				</div>
			</div>
		</div>
	</div>
</template>
