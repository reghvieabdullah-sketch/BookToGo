import { redirect } from '@sveltejs/kit';
import type { PageServerLoad } from './$types';
import { FN_USER_SETTINGS_SET } from '$lib/constants/postgressFunctionConstants';

export const load: PageServerLoad = async ({ url, cookies, locals: { supabase } }) => {
	const code = url.searchParams.get('code');
	const next = url.searchParams.get('next') ?? '/';

	if (code) {
		const { error } = await supabase.auth.exchangeCodeForSession(code);

		if (!error) {
			const {
				data: { user }
			} = await supabase.auth.getUser();

			if (user) {
				const pendingPhone = cookies.get('pending_phone') ?? null;

				// TODO - move this to a proper user settings page, but for now we will set the user settings here
				const {data, error } = await supabase.rpc(FN_USER_SETTINGS_SET, {
					p_name: user.user_metadata?.full_name ?? user.email ?? 'Unknown',
					p_email: user.email,
					p_phone: pendingPhone ?? user.user_metadata?.phone ?? null,
					p_role: 'customer'
				});
				if (error) console.error('Error setting user settings:', error);

				cookies.delete('pending_phone', { path: '/' });
			}
			throw redirect(303, next);
		}
	}
	throw redirect(303, '/auth/auth-code-error');
};