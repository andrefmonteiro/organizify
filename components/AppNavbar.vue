<script setup>
const { isLoggedIn, logIn, logOut } = useAuth()
</script>

<template>
	<header class="absolute inset-x-0 top-0 z-50 bg-muted">
		<nav class="flex items-center justify-between px-6 py-4 lg:px-8">
			<div class="flex items-center">
				<NuxtLink
					to="/"
				>
					<div class="text-2xl font-bold hover:opacity-80 transition-opacity">Organizify</div>
				</NuxtLink>
			</div>

			<div class="flex items-center">
				<NuxtLink
					v-if="!isLoggedIn"
					to="/dashboard"
				>
					<Button
						class="cursor-pointer"
						@click="logIn"
					>Login</Button>
				</NuxtLink>
				<UserAvatarDropdown v-else />
			</div>
		</nav>
	</header>
</template>
