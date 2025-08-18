<template>
	<div>
		<HeroSection />
		<HowItWorks />
	</div>
</template>

<script setup lang="ts">
// Page metadata for SEO
useHead({
	title: 'Organizify - Keep your musice neat',
	meta: [
		{
			name: 'description',
			content: 'Automatically organize your songs based on genres.',
		},
	],
})
</script>
