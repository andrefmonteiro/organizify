<script setup lang="ts">
</script>

<template>
	<div class="w-full max-w-lg space-y-6">
		<div>
			<h2 class="mt-12 mb-4 text-lg font-medium">
				Weekly Playlists
			</h2>
			<div class="space-y-4">
				<FeatureToggleCard
					title="Discover Weekly"
					description="Automatically save tracks from your Discover Weekly playlist."
				/>
				<FeatureToggleCard
					title="Release Radar"
					description="Automatically save tracks from your Release Radar playlist."
				/>
			</div>
		</div>
	</div>
</template>
