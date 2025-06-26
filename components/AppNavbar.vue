<script setup lang="ts">
import { useAuthActions } from '~/composables/useAuthActions'

const { isAuthenticated, signInWithSpotify } = useAuthActions()

const handleLogin = async () => {
	signInWithSpotify()
}
</script>

<template>
	<header class="fixed inset-x-0 z-50 top-02 bg-muted">
		<nav class="flex items-center justify-between px-6 py-4 lg:px-8">
			<div class="flex items-center">
				<NuxtLink
					to="/"
				>
					<div
						class="text-2xl font-bold transition-opacity hover:opacity-80"
					>Organizify</div>
				</NuxtLink>
			</div>

			<div class="flex items-center">
				<Button
					v-if="!isAuthenticated"
					class="h-8 px-4 cursor-pointer"
					@click="handleLogin"
				>
					Login
				</Button>

				<UserAvatarDropdown v-else />
			</div>
		</nav>
	</header>
</template>
