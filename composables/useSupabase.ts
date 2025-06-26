import { createClient, type SupabaseClient } from '@supabase/supabase-js'

let supabaseClient: SupabaseClient | null = null

export const useSupabase = () => {
	if (!supabaseClient) {
		const config = useRuntimeConfig()
		supabaseClient = createClient(
			config.public.supabaseUrl,
			config.public.supabaseKey,
		)
	}
	return supabaseClient
}
