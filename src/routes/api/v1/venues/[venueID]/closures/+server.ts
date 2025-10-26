import { QUERY_PARAM_VENUE_CLOSURE_ID } from "$lib/constants/postgressFunctionConstants";
import { deleteCachedData, getCachedData, setCachedData } from "$lib/dbFunctions/cacheHandler";
import { deleteVenueClosure, getVenueClosures, updateVenueClosures } from "$lib/dbFunctions/venuesDB";
import { json, type RequestHandler } from "@sveltejs/kit";

export const GET: RequestHandler = async ({ locals, params }) => {
    const { venueID } = params;
    const cacheKey = `closures:${locals.venueURL}`;
    const cached = await getCachedData(cacheKey);
    if (cached) return json(cached)

    const result = await getVenueClosures(locals.supabase, venueID);
    if (result.error) {
        return json({ error: result.error }, { status: 400 });
    }
    await setCachedData(cacheKey, result.data);
    return json(result.data, { status: 200 });
};

export const PUT: RequestHandler = async ({ locals, request, params }) => {
    const { venueID } = params;
    const closuresJSON = await request.json();
    const result = await updateVenueClosures(locals.supabase, venueID, closuresJSON);
    const cacheKey = [`closures:${locals.venueURL}`];
    if (result.error) {
        return json({ error: result.error }, { status: 400 });
    }
    await deleteCachedData(cacheKey);
    return json(result.data, { status: 200 });
};

export const DELETE: RequestHandler = async ({ locals, url }) => {
    const closureID = url.searchParams.get(QUERY_PARAM_VENUE_CLOSURE_ID);
    const result = await deleteVenueClosure(locals.supabase, closureID);
    const cacheKey = [`closures:${locals.venueURL}`];
    if (result.error) {
        return json({ error: result.error }, { status: 400 });
    }
    await deleteCachedData(cacheKey);
    return json(result.data, { status: 200 });
};