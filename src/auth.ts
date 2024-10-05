import { SvelteKitAuth } from "@auth/sveltekit"
import { DrizzleAdapter } from '@auth/drizzle-adapter'
import { db } from '$lib/server/db/schema_test'
import Apple from '@auth/sveltekit/providers/apple'
import Google from "@auth/sveltekit/providers/google"
import Facebook from "@auth/sveltekit/providers/facebook"
import GitHub from "@auth/sveltekit/providers/github"
import GitLab from "@auth/sveltekit/providers/gitlab"

export const { handle, signIn, signOut } = SvelteKitAuth({
	adapter: DrizzleAdapter(db),
	providers: [
		Apple,
		Google,
		Facebook,
		GitHub,
		GitLab,
	],
})
