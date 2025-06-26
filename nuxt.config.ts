// https://nuxt.com/docs/api/configuration/nuxt-config
import tailwindcss from '@tailwindcss/vite'

export default defineNuxtConfig({
	modules: ['@nuxt/eslint', 'shadcn-nuxt', '@nuxtjs/supabase'],
	devtools: { enabled: true },
	css: ['~/assets/css/tailwind.css'],
	runtimeConfig: {
		supabaseDbPassowrd: process.env.SUPABASE_DB_PASSWORD,
		public: {
			supabaseKey: process.env.SUPABASE_KEY,
			supabaseUrl: process.env.SUPABASE_URL,
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
	supabase: {
		redirect: true,
		redirectOptions: {
			login: '/',
			callback: '/confirm',
			exclude: ['/'],
			saveRedirectToCookie: true,
		},
	},
})
