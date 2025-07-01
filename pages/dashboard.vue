<script setup>
import { TriangleAlert } from 'lucide-vue-next'
import Alert from '~/components/ui/alert/Alert.vue'
import AlertDescription from '~/components/ui/alert/AlertDescription.vue'
import AlertTitle from '~/components/ui/alert/AlertTitle.vue'

definePageMeta({
	middleware: 'spotify-permissions',
})

const { signInWithSpotify } = useAuthActions()
const { hasValidPermissions, debugUserData, testActualTokenAccess, inspectSupabaseSession } = useSpotifyPermissions()
const { displayName } = useSpotifyProfile()

onMounted(() => {
	console.log('=== STARTING COMPREHENSIVE TOKEN INVESTIGATION ===')
	inspectSupabaseSession()
	testActualTokenAccess()
	debugUserData()
	console.log('=== INVESTIGATION COMPLETE ===')
},
)

const handleReconnect = async () => {
	await signInWithSpotify()
}
</script>

<template>
	<div>
		<Alert
			v-if="!hasValidPermissions"
			class="mt-4"
			variant="warning"
		>
			<TriangleAlert class="w-4 h-4" />
			<AlertTitle class="font-bold text-base">
				You're not connected
			</AlertTitle>
			<AlertDescription class="mt-2 text-base">
				Your Spotify permissions have been revoked or expired.
				Please reconnect your account to use Organizify's features.
			</AlertDescription>
			<div class="flex justify-start pl-6">
				<Button
					size=""
					class="mt-4 cursor-pointer"
					@click="handleReconnect"
				>
					Reconnect Spotify
				</Button>
			</div>
		</Alert>
		<h1 class="pt-16 pb-6 text-3xl font-bold tracking-tight sm:text-4xl">
			Hello{{ displayName ? `, ${displayName}` : '' }}!
		</h1>
		<Separator />
		<div
			:class="{ 'opacity-50 pointer-events-none': !hasValidPermissions }"
		>
			<WeeklyPlaylistsToggle />
		</div>
	</div>
</template>
