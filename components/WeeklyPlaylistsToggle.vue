<template>
	<div class="w-full max-w-lg space-y-6">
		<div>
			<h3 class="mt-12 mb-4 text-lg font-medium">
				Weekly Playlists
			</h3>
			<div class="space-y-4">
				<!-- Card 1 -->
				<div class="flex flex-row items-center justify-between p-4 border rounded-lg">
					<div class="space-y-0.5">
						<div class="text-base font-medium">
							Discover Weekly
						</div>
						<div class="text-sm text-muted-foreground">
							Automatically save tracks from your Discover Weekly playlist.
						</div>
					</div>
					<Switch />
				</div>

				<!-- Card 2 -->
				<div class="flex flex-row items-center justify-between p-4 border rounded-lg">
					<div class="space-y-0.5">
						<div class="text-base font-medium">
							Release Radar
						</div>
						<div class="text-sm text-muted-foreground">
							Automatically save tracks from your Release Radar playlist.
						</div>
					</div>
					<Switch />
				</div>
			</div>
		</div>
	</div>
</template>
