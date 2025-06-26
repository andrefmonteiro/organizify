<script setup>
const { spotifyProfile } = useSpotifyProfile()

definePageMeta({
	requiresAuth: true,
})
</script>

<template>
	<div>
		<h1 class="pt-16 pb-6 text-3xl font-bold tracking-tight sm:text-4xl">
			Hello, {{ spotifyProfile.display_name }}
		</h1>
		<Separator />
		<WeeklyPlaylistsToggle />
	</div>
</template>
