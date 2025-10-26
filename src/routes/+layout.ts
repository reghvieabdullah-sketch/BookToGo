import { createBrowserClient, createServerClient, isBrowser } from '@supabase/ssr'
import { PUBLIC_SUPABASE_ANON_KEY, PUBLIC_SUPABASE_URL } from '$env/static/public'
import type { LayoutLoad } from './$types'
import { courtDataStore, userLoggedInStore, venueDataStore, venueSettingsStore } from '$lib/bookingAssets/bookingStore'
import { INVALIDATE_PARENT_LAYOUT_CODE, QUERY_PARAM_VENUE_GET_BUNDLE } from '$lib/constants/postgressFunctionConstants'

export const load: LayoutLoad = async ({ data, depends, fetch, url }) => {
  const t0 = performance.now();

  depends('supabase:auth');
  depends(INVALIDATE_PARENT_LAYOUT_CODE);

  const supabaseInitStart = performance.now();
  const supabase = isBrowser()
    ? createBrowserClient(PUBLIC_SUPABASE_URL, PUBLIC_SUPABASE_ANON_KEY, { global: { fetch } })
    : createServerClient(PUBLIC_SUPABASE_URL, PUBLIC_SUPABASE_ANON_KEY, {
      global: { fetch },
      cookies: { getAll() { return data.cookies; } },
    });
  const supabaseInitEnd = performance.now();

  // --- Parallelized section ---
  const venueURL = 'stmarybball'; // NOTE: derive dynamically

  const parallelStart = performance.now();
  const [sessionRes, userRes, venueRes] = await Promise.all([
    supabase.auth.getSession(),
    supabase.auth.getUser(),
    fetch(`/api/v1/venues/${venueURL}?${QUERY_PARAM_VENUE_GET_BUNDLE}=1`)
  ]);
  const parallelEnd = performance.now();

  const {
    data: { session },
  } = sessionRes;

  const {
    data: { user },
  } = userRes;

  const jsonParseStart = performance.now();
  const { venueData, courtsData, settingsData } = await venueRes.json();
  const jsonParseEnd = performance.now();

  const storeStart = performance.now();
  if (isBrowser()) {
    venueDataStore.set(venueData);
    courtDataStore.set(courtsData);
    venueSettingsStore.set(settingsData);
    userLoggedInStore.set(!!user);
  }
  const storeEnd = performance.now();

  const totalEnd = performance.now();

  console.log(`[layout timings]
  Supabase init: ${(supabaseInitEnd - supabaseInitStart).toFixed(2)} ms
  Parallel block (session + user + venue fetch): ${(parallelEnd - parallelStart).toFixed(2)} ms
  response.json(): ${(jsonParseEnd - jsonParseStart).toFixed(2)} ms
  Store set: ${(storeEnd - storeStart).toFixed(2)} ms
  TOTAL layout load: ${(totalEnd - t0).toFixed(2)} ms
  `);

  return {
    session,
    supabase,
    venueID: venueData.venueID,
    venueData,
    courtsData,
    settingsData,
    userLoggedIn: !!user
  };
};
