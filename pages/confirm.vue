<script setup>
const user = useSupabaseUser()
const route = useRoute()

const MINIMUM_DISPLAY_TIME = 2500
const authCompleted = ref(false)
const minimumTimeElapsed = ref(false)

const oAuthError = computed(() => {
	return route.query.error || route.query.error_description
})

const canProceedToDashboard = computed(() => {
	return authCompleted.value && minimumTimeElapsed.value
})

onMounted(() => {
	if (oAuthError.value) {
		console.error('❌ OAuth error detected: ', oAuthError.value)
		return
	}

	setTimeout(() => {
		minimumTimeElapsed.value = true
	}, MINIMUM_DISPLAY_TIME)
})

watch(user, (newUser) => {
	if (newUser) {
		authCompleted.value = true
	}
}, { immediate: true })

watch(canProceedToDashboard, (canProceed) => {
	if (canProceed) navigateTo('/dashboard')
})

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
				v-if="oAuthError"
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
						{{ oAuthError }}
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
			</div>
		</div>
	</div>
</template>
