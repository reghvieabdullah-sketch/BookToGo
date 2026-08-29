import { QUERY_PARAM_VENUE_GET_BUNDLE } from "$lib/constants/postgressFunctionConstants";
import { deleteCachedData, getCachedData, setCachedData } from "$lib/dbFunctions/cacheHandler";
import { getVenueBundled } from "$lib/dbFunctions/venuesDB";
import { getVenueGeneralSettings, updateVenueGeneralSettings } from "$lib/dbFunctions/venuesDB";
import { json, type RequestHandler } from "@sveltejs/kit";

export const GET: RequestHandler = async ({ locals, params, url }) => {
    const { venueID } = params;
    const requestedBundle = QUERY_PARAM_VENUE_GET_BUNDLE in url.searchParams;
    const cacheKey = `venue:${locals.venueURL}:${requestedBundle ? 'bundled' : 'general'}`;
    
    const cached = await getCachedData(cacheKey);
    if (cached) return json(cached);

    const result = !requestedBundle
        ? await getVenueBundled(locals.supabase, venueID)
        : await getVenueGeneralSettings(locals.supabase, venueID);
    console.log(result);
    
    if (result.error) return json({ error: result.error }, { status: 400 });
    await setCachedData(cacheKey, result.data, 3600); // Cache for 10 hours
    return json(result.data, { status: 200 });
};

export const PUT: RequestHandler = async ({ locals, request, params }) => {
    const venueData = await request.json();
    const { venueID } = params;
    const cacheKeys = [`venue:${locals.venueURL}:general`, `venue:${locals.venueURL}:bundled`, `venue:${locals.venueURL}:settings`];
    const result = await updateVenueGeneralSettings(locals.supabase, venueData);
    await deleteCachedData(cacheKeys);
    return json(result);
};