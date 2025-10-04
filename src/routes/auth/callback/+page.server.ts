import { redirect } from '@sveltejs/kit';
import type { PageServerLoad } from './$types';
import { FN_USER_SETTINGS_SET } from '$lib/constants/postgressFunctionConstants';

export const load: PageServerLoad = async ({ url, locals: { supabase } }) => {
  const code = url.searchParams.get('code');
  const next = url.searchParams.get('next') ?? '/';
  console.log(url.searchParams);
  
  if (code) {
    const { error } = await supabase.auth.exchangeCodeForSession(code);

    if (!error) {
      // Fetch the authenticated user
      const { data: { user } } = await supabase.auth.getUser();

      if (user) {
        // Call the Postgres function to upsert into venue_user
        await supabase.rpc(FN_USER_SETTINGS_SET, {
          p_name: user.user_metadata?.full_name ?? user.email ?? 'Unknown',
          p_email: user.email,
          p_phone: user.user_metadata?.phone ?? null,
          p_role: 'user'
        });
      }
      console.log(next, ' next value');
      throw redirect(303, next);
    }
  }
  throw redirect(303, '/auth/auth-code-error');
};
