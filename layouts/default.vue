<template>
	<div class=" bg-surface-default text-foreground grid grid-rows-[1fr_auto] lg:grid-cols-[1fr_minmax(0,6fr)_1fr] lg:gap-x-6">
		<AppNavbar />

		<main class="px-6 lg:col-start-2 lg:px-0">
			<slot />
		</main>

		<div class="lg:col-span-3">
			<AppFooter />
		</div>
	</div>
</template>
