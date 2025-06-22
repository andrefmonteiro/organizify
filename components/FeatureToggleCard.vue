<script setup>
defineProps({
	title: String,
	description: String })
</script>

<template>
	<div class="flex flex-row items-center justify-between rounded-lg border p-4">
		<div class="space-y-0.5">
			<div class="text-base font-medium">
				{{ title }}
			</div>
			<div class="text-sm text-muted-foreground">
				{{ description }}
			</div>
		</div>
		<Switch />
	</div>
</template>
