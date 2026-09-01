import { error, redirect } from '@sveltejs/kit';
import type { PageServerLoad } from './$types';

// Adjust this to however your app currently determines the logged-in user
// and their role (e.g. locals.user from your auth hook/session).
export const load: PageServerLoad = async ({ locals }) => {
	const user = locals.user;
    const isSuperOwner = locals.isUserSuperOwner;
	if (!user) {
		// Not logged in at all — send them to login and bounce back here after.
		throw redirect(302, '/auth?next=' + encodeURIComponent('/createvenue'));
	}

	if (!isSuperOwner) {
		// Logged in, but not a super owner — hide the page entirely.
		throw error(302, '/');
	}

	return {
		adminName: user.user_metadata?.full_name ?? user.email
	};
};