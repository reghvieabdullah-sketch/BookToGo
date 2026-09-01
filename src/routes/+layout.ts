import { createBrowserClient, createServerClient, isBrowser } from '@supabase/ssr'
import { PUBLIC_SUPABASE_ANON_KEY, PUBLIC_SUPABASE_URL } from '$env/static/public'
import type { LayoutLoad } from './$types'
import { courtDataStore, userLoggedInStore, venueDataStore, venueSettingsStore } from '$lib/bookingAssets/bookingStore'
import { INVALIDATE_PARENT_LAYOUT_CODE, QUERY_PARAM_VENUE_GET_BUNDLE } from '$lib/constants/postgressFunctionConstants'


function getVenueURL(hostname: string): string | null {
    console.log('hostname recieved: ', hostname);

	const parts = hostname.split('.');

	if (parts.length < 3) return null;

	if (parts[0] === 'www') {
		return parts.length >= 4 ? parts[1] : null;
	}

	return parts[0] ?? 'stmarysbball';
}

export const load: LayoutLoad = async ({ data, depends, fetch, url }) => {
  const venueURL = getVenueURL(url.hostname);
  console.log("The venue URL", venueURL);
  
  // const venueURL = 'stjohnsbb';
  depends('supabase:auth');
  depends(INVALIDATE_PARENT_LAYOUT_CODE);

  const supabase = isBrowser()
    ? createBrowserClient(PUBLIC_SUPABASE_URL, PUBLIC_SUPABASE_ANON_KEY, { global: { fetch } })
    : createServerClient(PUBLIC_SUPABASE_URL, PUBLIC_SUPABASE_ANON_KEY, {
      global: { fetch },
      cookies: { getAll() { return data.cookies; } },
    });


  const [sessionRes, userRes, venueRes] = await Promise.all([
    supabase.auth.getSession(),
    supabase.auth.getUser(),
    fetch(`/api/v1/venues/${venueURL}?${QUERY_PARAM_VENUE_GET_BUNDLE}`)
  ]);

  const { data: { session } } = sessionRes;
  const { data: { user } } = userRes;

  const r = await venueRes.json();
  const { venueData, courtsData, settingsData } = r
  
  if (isBrowser()) {
    venueDataStore.set(venueData);
    courtDataStore.set(courtsData);
    venueSettingsStore.set(settingsData);
    userLoggedInStore.set(!!user);
  }


  return { session, supabase, venueID: venueData.venueID, venueData, courtsData, settingsData, userLoggedIn: !!user, isVenueOwner: data.isVenueOwner };
};
