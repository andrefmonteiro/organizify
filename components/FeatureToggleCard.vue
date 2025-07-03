<script setup lang="ts">
defineProps({
	title: String,
	description: String,
	enabled: Boolean,
	loading: Boolean,
})

// Define what events this component can emit
const emit = defineEmits(['toggle'])

// Track internal switch state
const isEnabled = ref(false)

// Handle switch change and emit to parent
const handleSwitchChange = (newValue: boolean) => {
	isEnabled.value = newValue
	// Emit the change to the parent component
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
			:model-value="isEnabled"
			:disabled="loading"
			@update:model-value="handleSwitchChange"
		/>
	</div>
</template>
