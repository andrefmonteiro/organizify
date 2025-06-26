<script setup lang="ts">
import { useAuthActions } from '~/composables/useAuthActions'

const { avatarUrl, displayName } = useSpotifyProfile()

const { signOut } = useAuthActions()
const handleLogout = async () => {
	signOut()
	await navigateTo('/')
}

const isOnDashboard = computed(() => useRoute().path == '/dashboard')

const primaryAvatarSrc = computed(() => {
	return avatarUrl.value || '/default-avatar.webp'
})

const userInitials = computed(() => {
	return displayName.value
		.split(' ')
		.map(word => word.charAt(0))
		.join('')
		.toUpperCase()
		.slice(0, 2)
})
</script>

<template>
	<DropdownMenu :modal="false">
		<DropdownMenuTrigger
			as-child
			class="cursor-pointer"
		>
			<Avatar>
				<AvatarImage
					:src="primaryAvatarSrc"
					alt="user's avatar"
				/>
				<AvatarFallback>
					{{ userInitials }}
				</AvatarFallback>
			</Avatar>
		</DropdownMenuTrigger>
		<DropdownMenuContent
			align="end"
			:side-offset="5"
		>
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
