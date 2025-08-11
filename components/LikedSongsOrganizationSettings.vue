<!-- eslint-disable @typescript-eslint/no-explicit-any -->

<script setup lang="ts">
const isOrganizing = ref<boolean>(false)
const isLoading = ref<boolean>(false)

const lastOrganizationResult = ref<any>(null)

const handleOrganizeToggle = async (enabled: boolean) => {
	if (!enabled) {
		isOrganizing.value = false
		isLoading.value = false
		lastOrganizationResult.value = null
		return
	}

	console.log('🎵 Starting server-side genre organization...')

	lastOrganizationResult.value = null

	try {
		const result = await $fetch('/api/spotify/organize-liked-songs', {
			method: 'POST',
		})

		if (result.success) {
			console.log('✅ Organization completed successfully!')

			if ('summary' in result) {
				console.log(`Created ${result.summary.playlistsCreated} playlists with ${result.summary.totalTracks} tracks`)
			}

			isOrganizing.value = true
			lastOrganizationResult.value = result
		}
		else {
			console.log('⚠️ Organization completed with issues:', result.message)

			lastOrganizationResult.value = result
		}
	}
	catch (error) {
		const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred'
		console.error('❌ Organization failed:', errorMessage)

		isOrganizing.value = false
		lastOrganizationResult.value = {
			success: false,
			message: `Failed to organize music: ${errorMessage}`,
		}
	}
	finally {
		isLoading.value = false
	}
}
</script>

<template>
	<div class="w-full max-w-lg space-y-6">
		<div>
			<h2 class="mt-12 mb-4 text-lg font-semibold">
				Liked Songs
			</h2>

			<div class="space-y-4">
				<FeatureToggleCard
					title="Organize by genre"
					description="Creates genre-themed playlists of your Liked Songs"
					:enabled="isOrganizing"
					:loading="isLoading"
					@toggle="handleOrganizeToggle"
				/>

				<div
					v-if="isLoading"
					class="p-4 bg-surface-default rounded-lg border space-y-3"
				>
					<div class="flex items-center space-x-3">
						<div class="animate-spin h-4 w-4 border-2 border-text-primary border-t-transparent rounded-full" />
						<p class="text-sm text-text-primary font-medium">
							Organizing your music library...
						</p>
					</div>

					<div class="text-xs text-text-secondary space-y-1">
						<p>🎵 Analyzing your liked songs and creating genre playlists</p>
						<p>⏱️ This may take a few moments for large libraries</p>
						<p>✨ Your browser will stay responsive while we work!</p>
					</div>

					<div class="text-xs text-text-tertiary">
						Processing on server... Feel free to browse other parts of the app.
					</div>
				</div>

				<div
					v-if="lastOrganizationResult && !isLoading"
					class="p-4 bg-surface-default rounded-lg border"
				>
					<div
						v-if="lastOrganizationResult.success"
						class="space-y-2"
					>
						<p class="text-sm text-text-primary font-medium">
							✅ {{ lastOrganizationResult.message }}
						</p>

						<div
							v-if="'summary' in lastOrganizationResult"
							class="text-xs text-text-secondary space-y-1"
						>
							<p>📊 Processed {{ lastOrganizationResult.summary.songsProcessed }} songs from your library</p>
							<p>📁 Created {{ lastOrganizationResult.summary.playlistsCreated }} playlists</p>
							<p>🎵 Organized {{ lastOrganizationResult.summary.totalTracks }} tracks total</p>
						</div>

						<div
							v-else-if="'playlistsCreated' in lastOrganizationResult"
							class="text-xs text-text-secondary"
						>
							<p>📁 Created {{ lastOrganizationResult.playlistsCreated }} playlists</p>
							<p v-if="lastOrganizationResult.totalTracks > 0">
								🎵 Organized {{ lastOrganizationResult.totalTracks }} tracks total
							</p>
						</div>

						<div
							v-if="lastOrganizationResult.playlists && lastOrganizationResult.playlists.length > 0"
							class="mt-3"
						>
							<p class="text-xs text-text-tertiary mb-1">
								Created playlists:
							</p>
							<div class="space-y-1">
								<div
									v-for="playlist in lastOrganizationResult.playlists"
									:key="playlist.playlistId"
									class="text-xs text-text-secondary"
								>
									🎼 {{ playlist.genre }} ({{ playlist.trackCount }} songs)
								</div>
							</div>
						</div>
					</div>

					<div
						v-else
						class="space-y-2"
					>
						<p class="text-sm text-text-primary font-medium">
							⚠️ {{ lastOrganizationResult.message }}
						</p>
						<p class="text-xs text-text-tertiary">
							You can try again or check your Spotify permissions.
						</p>
					</div>
				</div>
			</div>
		</div>
	</div>
</template>
