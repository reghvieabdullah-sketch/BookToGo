import { createBrowserClient, createServerClient, isBrowser } from '@supabase/ssr'
import { PUBLIC_SUPABASE_ANON_KEY, PUBLIC_SUPABASE_URL } from '$env/static/public'
import type { LayoutLoad } from './$types'
import type { courtsType, VenueData, VenueSettings } from '../types/bookingTypes'
import { courtDataStore, userLoggedInStore, venueDataStore, venueSettingsStore } from '$lib/bookingAssets/bookingStore'
import { INVALIDATE_PARENT_LAYOUT_CODE, QUERY_PARAM_VENUE_GET_BUNDLE } from '$lib/constants/postgressFunctionConstants'

export const load: LayoutLoad = async ({ data, depends, fetch, url }) => {
  /**
   * Declare a dependency so the layout can be invalidated, for example, on
   * session refresh.
   */
  depends('supabase:auth')
  depends(INVALIDATE_PARENT_LAYOUT_CODE);

  const supabase = isBrowser()
    ? createBrowserClient(PUBLIC_SUPABASE_URL, PUBLIC_SUPABASE_ANON_KEY, {
      global: {
        fetch,
      },
    })
    : createServerClient(PUBLIC_SUPABASE_URL, PUBLIC_SUPABASE_ANON_KEY, {
      global: {
        fetch,
      },
      cookies: {
        getAll() {
          return data.cookies
        },
      },
    })

  /**
   * It's fine to use `getSession` here, because on the client, `getSession` is
   * safe, and on the server, it reads `session` from the `LayoutData`, which
   * safely checked the session using `safeGetSession`.
   */
  const {
    data: { session },
  } = await supabase.auth.getSession()

  const {
    data: { user },
  } = await supabase.auth.getUser()
  const venueURL = 'stmarybball'; // must actually get this via splitting the URL up.
  const response = await fetch(`/api/v1/venues/${venueURL}?${QUERY_PARAM_VENUE_GET_BUNDLE}=1`)

  const { venueData, courtsData, settingsData } = await response.json();
  
  if (isBrowser()) {
    venueDataStore.set(venueData);
    courtDataStore.set(courtsData);
    venueSettingsStore.set(settingsData);
    userLoggedInStore.set(!!user);
  }


  return {
    session,
    supabase,
    venueID: venueData.venueID,
    venueData,
    courtsData,
    settingsData,
    userLoggedIn: !!user
  };
}