import { redirect, fail } from '@sveltejs/kit';
import type { Actions } from './$types';

const LK_PHONE_REGEX = /^(?:\+?94|0)7[0124-8]\d{7}$/;

function toE164(raw: string) {
	const digits = raw.replace(/[\s-]/g, '');
	if (!LK_PHONE_REGEX.test(digits)) return null;
	return '+94' + digits.replace(/^(\+?94|0)/, '');
}

export const actions: Actions = {
	loginWithGoogle: async ({ locals: { supabase, venueURL }, url, request, cookies }) => {
		const next = url.searchParams.get('next') ?? '/';

		const formData = await request.formData();
		const rawPhone = formData.get('phone')?.toString() ?? '';
		const phone = toE164(rawPhone);

		if (!phone) {
			return fail(400, { error: 'A valid Sri Lankan phone number is required.' });
		}

		// Stash the phone number so the callback (a separate request, after
		// the round trip to Google) can pick it up.
		cookies.set('pending_phone', phone, {
			path: '/',
			httpOnly: true,
			secure: true,
			sameSite: 'lax',
			maxAge: 60 * 10 // 10 minutes, plenty for the OAuth round trip
		});
		console.log(`THE URL OUT IS: ${url.origin}/auth/callback?next=${encodeURIComponent(next)}`);
		
		const { data, error } = await supabase.auth.signInWithOAuth({
			provider: 'google',
			options: {
				redirectTo: `${url.origin}/auth/callback?next=${encodeURIComponent(next)}`,
				queryParams: {
					access_type: 'offline',
					prompt: 'consent'
				}
			}
		});

		if (error) {
			console.error('OAuth error:', error);
			throw redirect(303, '/auth/error');
		}
		console.log("THE DATA.URL VALUE IS ", data.url);
		
		if (data.url) {
			throw redirect(303, data.url);
		}

		throw redirect(303, '/auth/error');
	}
};