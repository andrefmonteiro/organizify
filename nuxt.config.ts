// https://nuxt.com/docs/api/configuration/nuxt-config
import tailwindcss from '@tailwindcss/vite'

export default defineNuxtConfig({
	modules: ['@nuxt/eslint', 'shadcn-nuxt'],
	devtools: { enabled: true },
	css: ['~/assets/css/tailwind.css'],
	runtimeConfig: {
		supabaseDbPassowrd: process.env.SUPABASE_DB_PASSWORD,
		public: {
			supabaseUrl: process.env.SUPABASE_URL,
			supabaseKey: process.env.SUPABASE_KEY,
		},
	},
	compatibilityDate: '2024-11-01',
	vite: {
		plugins: [
			tailwindcss(),
		],
	},
	eslint: {
		config: {
			stylistic: {
				indent: 'tab',
			},
		},
	},
	shadcn: {
		prefix: '',
		/**
     * Directory that the component lives in.
     * @default "./components/ui"
     */
		componentDir: './components/ui',
	},
})
