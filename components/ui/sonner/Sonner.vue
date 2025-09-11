<script lang="ts" setup>
import type { ToasterProps } from 'vue-sonner'
import { Toaster as Sonner } from 'vue-sonner'

const props = defineProps<ToasterProps>()
</script>

<template>
	<Sonner
		class="toaster group"
		v-bind="props"
		:style="{
			'--normal-bg': 'var(--popover)',
			'--normal-text': 'var(--popover-foreground)',
			'--normal-border': 'var(--border)',
		}"
	/>
</template>

<style scoped>
:deep([data-sonner-toast]) {
	min-width: 420px !important;
	max-width: 500px !important;
}

:deep([data-sonner-toast] [data-description]) {
	white-space: pre-line !important;
}
</style>
