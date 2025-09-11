<script setup lang="ts">
const currYear = new Date().getFullYear()
</script>

<template>
	<footer class="mt-16 bg-muted/5 lg:col-span-3">
		<div class="px-6 py-12 mx-auto max-w-7xl lg:px-8">
			<div class="text-sm text-center text-muted-foreground">
				<p>
					&copy; {{ currYear }} Organizify. Made by <a
						class="underline"
						href="https://andremonteiro.me"
						target="_blank"
					>André Monteiro</a>
				</p>
			</div>
		</div>
	</footer>
</template>
