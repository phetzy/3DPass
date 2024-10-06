import { SvelteKitAuth } from "@auth/sveltekit"
import { DrizzleAdapter } from '@auth/drizzle-adapter'
import { db } from '$lib/server/db/schema'
import Google from "@auth/sveltekit/providers/google"

export const { handle, signIn, signOut } = SvelteKitAuth({
	adapter: DrizzleAdapter(db),
	providers: [
		Google,
	],
})
