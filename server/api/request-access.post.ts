export default defineEventHandler(async (event) => {
	const { email } = await readBody(event)

	if (!email || !email.includes('@')) {
		throw createError({ statusCode: 400, statusMessage: 'Invalid email' })
	}

	const webhookUrl = process.env.DISCORD_WEBHOOK_URL
	if (!webhookUrl) {
		throw createError({ statusCode: 500, statusMessage: 'Webhook not configured' })
	}

	await fetch(webhookUrl, {
		method: 'POST',
		headers: { 'Content-Type': 'application/json' },
		body: JSON.stringify({
			content: `🔔 New access request: ${email}`,
		}),
	})

	return { success: true }
})
