<script setup lang="ts">
import { useAuthActions } from '~/composables/useAuthActions'

const { isAuthenticated, signInWithSpotify } = useAuthActions()

const handleLogin = async () => {
	signInWithSpotify()
}
</script>

<template>
	<header class="col-span-full bg-surface-muted">
		<nav class="flex justify-between mx-12 my-6">
			<div class="flex items-center">
				<NuxtLink
					to="/"
				>
					<div
						class="text-2xl transition-opacity font-display font-bold  hover:opacity-80"
					>Organizify</div>
				</NuxtLink>
			</div>

			<div class="flex items-center">
				<Button
					v-if="!isAuthenticated"
					class="h-8 px-4 cursor-pointer bg-brand-green hover:bg-brand-green-light"
					@click="handleLogin"
				>
					Login
				</Button>

				<UserAvatarDropdown v-else />
			</div>
		</nav>
	</header>
</template>
