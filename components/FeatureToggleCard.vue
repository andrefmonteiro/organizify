<script setup>
defineProps({
	title: String,
	description: String })
</script>

<template>
	<div class="flex flex-row items-center justify-between p-4 border rounded-lg">
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
