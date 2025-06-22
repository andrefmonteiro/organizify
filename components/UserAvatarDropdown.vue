<script setup lang="ts">
const { logOut } = useAuth()

const handleLogout = async () => {
	logOut()
	await navigateTo('/')
}

const isOnDashboard = computed(() => useRoute().path == '/dashboard')
</script>

<template>
	<DropdownMenu>
		<DropdownMenuTrigger
			as-child
			class="cursor-pointer"
		>
			<Avatar>
				<AvatarImage
					src="/default-avatar.webp"
					alt="default avatar"
				/>
				<AvatarFallback>AM</AvatarFallback>
			</Avatar>
		</DropdownMenuTrigger>
		<DropdownMenuContent>
			<DropdownMenuItem
				v-if="!isOnDashboard"
				class="cursor-pointer"
				as-child
			>
				<NuxtLink to="/dashboard">
					Dashboard
				</NuxtLink>
			</DropdownMenuItem>
			<DropdownMenuSeparator v-if="!isOnDashboard" />
			<DropdownMenuItem
				class="cursor-pointer"
				as-child
			>
				<a @click="handleLogout">
					Log out
				</a>
			</DropdownMenuItem>
		</DropdownMenuContent>
	</DropdownMenu>
</template>
