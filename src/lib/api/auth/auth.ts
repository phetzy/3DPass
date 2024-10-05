import { SvelteKitAuth } from "@auth/sveltekit"
import Apple from "@auth/sveltekit/providers/apple"
import Facebook from "@auth/sveltekit/providers/facebook"
import GitHub from "@auth/sveltekit/providers/github"
import Google from "@auth/sveltekit/providers/google"

export const { handle } = SvelteKitAuth({
    providers: [
        Google,
        GitHub,
        Facebook,
        Apple,
    ],
})
