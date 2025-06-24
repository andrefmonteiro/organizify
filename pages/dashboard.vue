<script setup>
definePageMeta({
	middleware: 'auth',
})
</script>

<template>
	<div>
		<h1 class="pt-16 pb-6 text-3xl font-bold tracking-tight sm:text-4xl">
			Dashboard
		</h1>
		<Separator />
		<WeeklyPlaylistsToggle />
	</div>
</template>
