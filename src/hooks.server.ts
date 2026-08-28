import { createServerClient } from "@supabase/ssr";
import { type Handle, redirect } from '@sveltejs/kit'
import { sequence } from "@sveltejs/kit/hooks";

import { PUBLIC_SUPABASE_URL, PUBLIC_SUPABASE_ANON_KEY } from '$env/static/public'
import { isUserVenueOwner } from "$lib/dbFunctions/venuesDB";

const supabase: Handle = async ({ event, resolve }) => {
    const host = event.request.headers.get('host') ?? '';
    const subdomain = 'stmarybball'; // PLEASE REMEMBER TO NEVER HAVE THIS HARDCODED
    event.locals.venueURL = subdomain;
    event.locals.supabase = createServerClient(PUBLIC_SUPABASE_URL, PUBLIC_SUPABASE_ANON_KEY, {
        cookies: {
            getAll: () => event.cookies.getAll(),
            setAll: (cookiesToSet) => {
                cookiesToSet.forEach(({ name, value, options }) => {
                    event.cookies.set(name, value, { ...options, path: '/' })
                })
            }
        }
    })
    event.locals.safeGetSession = async () => {
        const { data: { session } } = await event.locals.supabase.auth.getSession()
        if (!session) return { session: null, user: null }
        const { data: { user }, error } = await event.locals.supabase.auth.getUser();
        if (error) return { session: null, user: null }
        return { session, user }
    }

    return resolve(event, {
        filterSerializedResponseHeaders(name) {
            return name === 'content-range' || name === 'x-supabase-api-version'
        },
    })
}
const authGuard: Handle = async ({ event, resolve }) => {
    const { session, user } = await event.locals.safeGetSession();
    event.locals.session = session;
    event.locals.user = user;


    // TODO - make it so that the venue owner can go to the dashboard and normal users cant
    // Also make it possible to pass in venueID using locals
    if (!session && event.url.pathname.startsWith('/dashboard')) {
        throw redirect(303, '/auth?next=' + encodeURIComponent(event.url.pathname));
    } else if (event.url.pathname.startsWith('/dashboard') && !isUserVenueOwner(event.locals.supabase, event.locals.venueURL)) {
        console.log("Redirecting to home page");
        
        throw redirect(303, '/');
    }
     else if (session && event.url.pathname.startsWith('/auth')) {
        throw redirect(303, '/');
    }
    return resolve(event);
};

export const handle: Handle = sequence(supabase, authGuard)