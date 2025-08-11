<script setup lang="ts">
defineProps({
	title: String,
	description: String,
	enabled: Boolean,
	loading: Boolean,
})

const emit = defineEmits(['toggle'])

const handleSwitchChange = (newValue: boolean) => {
	// Now we can use the emit function we captured abov
	// The parent will decide how to handle state change
	emit('toggle', newValue)
}
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

		<Switch
			:model-value="enabled"
			:disabled="loading"
			@update:model-value="handleSwitchChange"
		/>
	</div>
</template>
