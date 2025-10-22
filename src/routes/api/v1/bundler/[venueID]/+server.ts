import { QUERY_PARAM_VENUE_BOOKING_DATE_END, QUERY_PARAM_VENUE_BOOKING_DATE_START } from "$lib/constants/postgressFunctionConstants";
import { getBookingClosureBundle } from "$lib/dbFunctions/bookingsDB";
import { getCachedData, setCachedData } from "$lib/dbFunctions/cacheHandler";
import { json, type RequestHandler } from "@sveltejs/kit";

export const GET: RequestHandler = async ({ url, params, locals }) => {
    const { venueID } = params;
    const dateStart = url.searchParams.get(QUERY_PARAM_VENUE_BOOKING_DATE_START) as string;
    const dateEnd = url.searchParams.get(QUERY_PARAM_VENUE_BOOKING_DATE_END) as string;

    const cacheKey = `bookingclosures:${locals.venueURL}:bundled`;
    const cache = await getCachedData(cacheKey);
    if (cache) return json(cache);

    const result = await getBookingClosureBundle(locals.supabase, venueID, dateStart, dateEnd);
    
    if (result.error) return json({ error: result.error }, { status: 400 });
    await setCachedData(cacheKey, result.data, 36000);
    return json(result.data, { status: 200 });
};
