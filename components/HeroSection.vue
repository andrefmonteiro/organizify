<script setup>
import { useAuthActions } from '~/composables/useAuthActions'

const { isAuthenticated, signInWithSpotify } = useAuthActions()

const handleLogin = async () => {
	if (!isAuthenticated.value) {
		signInWithSpotify()
	}
	else {
		navigateTo('/dashboard')
	}
}
</script>

<template>
	<div class="relative isolate">
		<div class="py-20 sm:py-24 lg:py-28">
			<div class="text-center">
				<h1 class="text-4xl text-balance sm:text-6xl font-display font-extrabold tracking-tight">
					Finally tidy up <br>your Liked Songs
				</h1>

				<div class="max-w-2xl mx-auto mt-4 md:mt-8">
					<p class="text-lg leading-8 text-text-secondary">
						It's hard to stay organized.
						<br>
						Organizify analyzes your Spotify's Liked Songs and creates genre-based playlists.
					</p>
				</div>

				<div class="flex items-center justify-center mt-12 gap-x-6">
					<Button
						size="lg"
						class="px-8 cursor-pointer bg-brand-green hover:bg-brand-green-light"
						@click="handleLogin"
					>
						Try it
					</Button>

					<Button
						size="lg"
						class=" font-semibold"
						variant="outline"
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
