import { deleteCachedData, getCachedData, setCachedData } from "$lib/dbFunctions/cacheHandler";
import { getVenueCourts, updateVenueCourts } from "$lib/dbFunctions/venuesDB";
import { json, type RequestHandler } from "@sveltejs/kit";

export const GET: RequestHandler = async ({ locals, params }) => {
    const { venueID } = params;
    const cacheKey = `venue:${locals.venueURL}:courts`;

    const cached = await getCachedData(cacheKey);
    if (cached) return json(cached);

    const result = await getVenueCourts(locals.supabase, venueID);
    if (result.error) return json({ error: result.error }, { status: 400 });
    setCachedData(cacheKey, result.data, 36000); // Cache for 10 hours
    return json(result.data, { status: 200 })
};

export const PUT: RequestHandler = async ({ locals, request, params }) => {
    const courtsJSON = await request.json();
    const { venueID } = params;
    console.log('the url told to change is ', locals.venueURL);

    const cacheKeys = [`venue:${locals.venueURL}:courts`, `venue:${locals.venueURL}:bundled`];
    const result = await updateVenueCourts(locals.supabase, courtsJSON, venueID)
    if (result.error) {
        return json({ error: result.error }, { status: 400 });
    };
    // Only delete the cache if the update was successful
    await deleteCachedData(cacheKeys);
    return json(result.data, { status: 200 })
};