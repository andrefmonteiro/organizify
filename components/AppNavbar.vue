<script setup lang="ts">
const { isLoggedIn, logIn } = useAuth()

const handleLogin = async () => {
	logIn()
	await navigateTo('/dashboard')
}
</script>

<template>
	<header class="fixed inset-x-0 top-02 z-50 bg-muted">
		<nav class="flex items-center justify-between px-6 py-4 lg:px-8">
			<div class="flex items-center">
				<NuxtLink
					to="/"
				>
					<div class="text-2xl font-bold hover:opacity-80 transition-opacity">Organizify</div>
				</NuxtLink>
			</div>

			<div class="flex items-center">
				<Button
					v-if="!isLoggedIn"
					class="cursor-pointer h-8 px-4"
					@click="handleLogin"
				>
					Login
				</Button>

				<UserAvatarDropdown v-else />
			</div>
		</nav>
	</header>
</template>
