<script setup lang="ts">
defineProps({
	title: String,
	description: String,
})
</script>

<template>
	<div class="flex flex-row items-center justify-between p-4 border border-surface-muted rounded-lg">
		<div class="space-y-0.5">
			<div class="text-base font-medium">
				{{ title }}
			</div>
			<div class="text-sm text-text-secondary">
				{{ description }}
			</div>
		</div>
		<slot />
	</div>
</template>
