import { QUERY_PARAM_VENUE_ID } from "$lib/constants/postgressFunctionConstants";
import { deleteCachedData, getCachedData, setCachedData } from "$lib/dbFunctions/cacheHandler";
import { getVenueSettings, updateVenueSettings } from "$lib/dbFunctions/venuesDB";
import { json, type RequestHandler } from "@sveltejs/kit";

export const GET: RequestHandler = async ({ locals, url, params }) => {
    const { venueID } = params;
    const cacheKey = `venue:${locals.venueURL}:settings`;

    const cached = await getCachedData(cacheKey);
    if (cached) return json(cached);

    const result = await getVenueSettings(locals.supabase, venueID);
    if (result.error) return json({ error: result.error }, { status: 400 });
    setCachedData(cacheKey, result.data, 36000); // Cache for 10 hours
    return json(result.data, { status: 200 });
};

export const PUT: RequestHandler = async ({ locals, request, params }) => {
    const settingsJSON = await request.json();
    const { venueID } = params;
    const result = await updateVenueSettings(locals.supabase, settingsJSON, venueID);
    const cacheKeys = [`venue:${locals.venueURL}:settings`, `venue:${locals.venueURL}:bundled`];
    if (result.error) {
        return json({ error: result.error }, { status: 400 });
    };
    // Only delete the cache if the update was successful
    await deleteCachedData(cacheKeys);
    return json(result.data, { status: 200 });
}