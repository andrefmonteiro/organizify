<!-- components/AccountSettings.vue -->
<script setup lang="ts">
import { Trash2 } from 'lucide-vue-next'

const handleDeleteAccount = async () => {
	await $fetch('/api/auth/delete-account', { method: 'POST' })
	const { signOut } = useAuthActions()
	signOut()
	await navigateTo('/')
}
</script>

<template>
	<div class="w-full max-w-xl space-y-6">
		<div>
			<h2 class="mt-12 mb-4 text-xl font-semibold">
				Account
			</h2>

			<FeatureCard
				title="Delete account"
				description="Permanently delete your account and all your data"
			>
				<AlertDialog>
					<AlertDialogTrigger as-child>
						<Button
							variant="destructive"
							class="cursor-pointer hover:bg-red-900"
						>
							<Trash2 class="w-4 h-4" />
							Delete account
						</Button>
					</AlertDialogTrigger>
					<AlertDialogContent>
						<AlertDialogHeader>
							<AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
							<AlertDialogDescription>
								This action cannot be undone. We're sad to see you go, though.
							</AlertDialogDescription>
						</AlertDialogHeader>
						<AlertDialogFooter class="mt-2">
							<AlertDialogCancel class="cursor-pointer">
								Cancel
							</AlertDialogCancel>
							<AlertDialogAction
								variant="destructive"
								class="cursor-pointer bg-destructive hover:bg-red-900"
								@click="handleDeleteAccount"
							>
								Yes, delete my account
							</AlertDialogAction>
						</AlertDialogFooter>
					</AlertDialogContent>
				</AlertDialog>
			</FeatureCard>
		</div>
	</div>
</template>
