import { redirect } from '@sveltejs/kit';
import type { Actions } from './$types';



export const actions: Actions = {
  loginWithGoogle: async ({ locals: { supabase }, url }) => {
    
    const next = url.searchParams.get('next') ?? '/';
    const { data, error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: `${url.origin}/auth/callback?next=${encodeURIComponent(next)}`,
        queryParams: {
          access_type: 'offline',
          prompt: 'consent',
        }
      }
    });

    if (error) {
      console.error('OAuth error:', error);
      throw redirect(303, '/auth/error');
    }

    if (data.url) {
      throw redirect(303, data.url);
    }

    throw redirect(303, '/auth/error');
  }

};
