<template>
	<div class="relative isolate">
		<div class="py-20 sm:py-24 lg:py-32">
			<div class="text-center">
				<h1 class="text-4xl font-bold text-balance sm:text-6xl">
					Never lose your favorite tracks again
				</h1>

				<div class="mt-6 mx-auto max-w-2xl">
					<p class="text-lg leading-8 text-muted-foreground">
						Annoyed by Discover Weekly and Release Radar disappearing every week?
						<br>
						Organizify automatically saves these tracks to permanent playlists,
						so you never lose track of music you love.
					</p>
				</div>

				<div class="mt-10 flex items-center justify-center gap-x-6">
					<Button
						size="lg"
						class="px-8 cursor-pointer"
					>
						Try it
					</Button>

					<Button
						size="lg"
						class="px-8 font-semibold"
						variant="link"
						as-child
					>
						<a href="#how-it-works">
							Learn more <span aria-hidden="true">→</span>
						</a>
					</Button>
				</div>
			</div>
		</div>
	</div>
</template>
