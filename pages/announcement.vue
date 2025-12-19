<script setup>
const email = ref('')
const isSubmitting = ref(false)
const message = ref('')

const submitEmail = async () => {
	isSubmitting.value = true
	try {
		await $fetch('/api/request-access', {
			method: 'POST',
			body: { email: email.value },
		})
		message.value = 'Thanks! We\'ll contact you soon.'
		email.value = ''
	}
	catch {
		message.value = 'Please try again.'
	}
	isSubmitting.value = false
}
</script>

<template>
	<div class="max-w-4xl mx-auto mt-12 px-2 md:px-8 overflow-x-hidden">
		<h1 class="text-3xl font-bold mb-8 text-text-primary">
			Why Organizify is invite-only
		</h1>

		<div class="space-y-6">
			<p class="text-text-primary">
				In May 2025, Spotify <a
					class="underline underline-offset-3"
					href="https://developer.spotify.com/blog/2025-04-15-updating-the-criteria-for-web-api-extended-access"
				>changed their developer program, effectively ending public indie app development.</a>
			</p>

			<div class="space-y-4">
				<h2 class="text-xl font-bold text-text-primary">
					What Changed:
				</h2>
				<p class="text-text-primary">
					Previously, developers could apply for production access to build apps for everyone.
					Now Spotify only approves "established, scalable" companies that "align with their platform strategy."
				</p>

				<p class="text-text-primary">
					Translation: Only bigger projects and official partners get approved. Small developers and creative projects are shut out.
				</p>
			</div>

			<div class="space-y-4 flex flex-col">
				<h2 class="text-xl font-bold text-text-primary">
					How This Affects Organizify
				</h2>
				<p class="text-text-primary">
					We're stuck in "development mode," which limits us to <strong>25 users</strong>.
					We can't grow beyond that without Spotify's approval, which they're unlikely to grant to indie apps again.
				</p>

				<p class="text-text-primary">
					The good news: there are a few seats left.
				</p>
				<p>
					If you'd like access, we need to manually add you. You can leave your email and we'll let you once you can start using the app.
				</p>
				<div class="space-y-4 mt-8 p-6 bg-brand-green-muted rounded-lg md:w-xl self-center">
					<h3 class="text-lg font-semibold text-text-primary">
						Request Access
					</h3>

					<form
						@submit.prevent="submitEmail"
					>
						<div class="flex flex-col sm:flex-row gap-3">
							<input
								v-model="email"
								type="email"
								placeholder="your@email.com"
								required
								class="flex-1 px-6 py-2 border border-border rounded-md bg-background text-text-primary"
							>
							<Button
								type="submit"
								:disabled="isSubmitting"
								class="cursor-pointer"
							>
								{{ isSubmitting ? 'Submitting...' : 'Submit' }}
							</Button>
						</div>
						<p
							v-if="message"
							class="text-sm text-text-secondary"
						>
							{{ message }}
						</p>
					</form>
				</div>
			</div>
		</div>
	</div>
</template>
