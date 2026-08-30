import { redirect } from '@sveltejs/kit';
import type { PageServerLoad } from './$types';
import { FN_USER_SETTINGS_SET } from '$lib/constants/postgressFunctionConstants';

export const load: PageServerLoad = async ({ url, locals: { supabase } }) => {
  const code = url.searchParams.get('code');
  const next = url.searchParams.get('next') ?? '/';
  if (code) {
    const { error } = await supabase.auth.exchangeCodeForSession(code);

    if (!error) {
      // Fetch the authenticated user
      const { data: { user } } = await supabase.auth.getUser();

      if (user) {
        // TODO - move this to a proper user settings page, but for now we will set the user settings here
        await supabase.rpc(FN_USER_SETTINGS_SET, {
          p_name: user.user_metadata?.full_name ?? user.email ?? 'Unknown',
          p_email: user.email,
          p_phone: user.user_metadata?.phone ?? null,
          p_role: 'customer'
        });
      }
      throw redirect(303, next);
    }
  }
  throw redirect(303, '/auth/auth-code-error');
};
