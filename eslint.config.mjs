// @ts-check
import withNuxt from './.nuxt/eslint.config.mjs'

export default withNuxt({
	ignores: [
		'lib/utils.backup.ts',
		'lib/utils.ts',
		'**/*.backup.ts',
		'**/*.backup.js',
	],
})
