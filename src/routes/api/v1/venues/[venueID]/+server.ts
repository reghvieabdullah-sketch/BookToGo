import { QUERY_PARAM_VENUE_GET_BUNDLE } from "$lib/constants/postgressFunctionConstants";
import { getVenueBundled } from "$lib/dbFunctions/venuesDB";
import { getVenueGeneralSettings, updateVenueGeneralSettings } from "$lib/dbFunctions/venuesDB";
import { json, type RequestHandler } from "@sveltejs/kit";
import Redis from "ioredis";
import { REDIS_URL } from "$env/static/private";
if (!REDIS_URL) {
    throw new Error('REDIS_URL not set in environment');
}
const redis = new Redis(REDIS_URL!);

export const GET: RequestHandler = async ({ locals, params, url }) => {
    const { venueID } = params;
    const getBundledData = url.searchParams.get(QUERY_PARAM_VENUE_GET_BUNDLE);
    const requestedBundle = getBundledData === '1';
    const cacheKey = `venue:${venueID}:${requestedBundle ? 'bundled' : 'general'}`;
    const cached = await redis.get(cacheKey);

    if (cached) return json(JSON.parse(cached))


    // Get the Response object
    const response = requestedBundle
        ? await getVenueBundled(locals.supabase, venueID)
        : await getVenueGeneralSettings(locals.supabase, venueID);

    // Extract the actual data from the Response
    const responseClone = response.clone(); // Clone so we can read it twice
    const responseData = await responseClone.json();

    // Cache the data as a string
    await redis.set(cacheKey, JSON.stringify(responseData)); // NO TTL, must be manually invalidated

    // Return the original response
    return response;
};

export const PUT: RequestHandler = async ({ locals, request, params }) => {
    const venueData = await request.json();
    const { venueID } = params;
    const cacheKeys = [`venue:${venueID}:general`, `venue:${venueID}:bundled`];
    await redis.del(cacheKeys); // for testing purposes
    return updateVenueGeneralSettings(locals.supabase, venueData)
};