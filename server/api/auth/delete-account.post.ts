import { serverSupabaseServiceRole, serverSupabaseUser } from '#supabase/server'

export default defineEventHandler(async (event) => {
	try {
		const user = await serverSupabaseUser(event)
		if (!user?.id) {
			throw createError({ statusCode: 401, statusMessage: 'Not authenticated' })
		}

		const supabase = await serverSupabaseServiceRole(event)

		await supabase.from('user_processed_songs').delete().eq('user_id', user.id)
		await supabase.from('user_genre_playlists').delete().eq('user_id', user.id)
		await supabase.from('profiles').delete().eq('id', user.id)

		const { error } = await supabase.auth.admin.deleteUser(user.id)
		if (error) {
			console.error('Delete user error:', error)
			throw createError({ statusCode: 500, statusMessage: 'Failed to delete account' })
		}

		return { success: true }
	}
	catch (error) {
		console.error('Account deletion failed:', error)
		throw error
	}
})
