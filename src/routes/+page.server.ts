import { redirect } from "@sveltejs/kit"
import type { PageServerLoad } from "./$types"

export const load: PageServerLoad = async (events) => {
	const session = await events.locals.auth()

	//if (!session?.user?.id) {
	//	redirect(303, `/auth/signin`)
	//}

	return {
		session,
	}
}
