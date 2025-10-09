import { QUERY_PARAM_VENUE_BOOKING_DATE_END, QUERY_PARAM_VENUE_BOOKING_DATE_START } from "$lib/constants/postgressFunctionConstants";
import { getBookingClosureBundle } from "$lib/dbFunctions/bookingsDB";
import { getCachedData, setCachedData } from "$lib/dbFunctions/cacheHandler";
import { json, type RequestHandler } from "@sveltejs/kit";

export const GET: RequestHandler = async ({ url, params, locals }) => {
    const totalStart = performance.now(); // 👈 overall timer start

    const { venueID } = params;
    const dateStart = url.searchParams.get(QUERY_PARAM_VENUE_BOOKING_DATE_START) as string;
    const dateEnd = url.searchParams.get(QUERY_PARAM_VENUE_BOOKING_DATE_END) as string;

    const cacheKey = `bookingclosures:${locals.venueURL}:bundled`;

    console.log(`[API] checking cache for key ${cacheKey}`);
    const cacheCheckStart = performance.now();
    const cache = await getCachedData(cacheKey);
    const cacheCheckEnd = performance.now();

    if (cache) {
        console.log(`[API] Cache hit in ${(cacheCheckEnd - cacheCheckStart).toFixed(2)} ms`);
        console.log(`[API] Total time: ${(performance.now() - totalStart).toFixed(2)} ms`);
        return json(cache);
    }

    console.log(`[API] Cache miss (checked in ${(cacheCheckEnd - cacheCheckStart).toFixed(2)} ms)`);

    const dbFetchStart = performance.now();
    const result = await getBookingClosureBundle(locals.supabase, venueID, dateStart, dateEnd);
    const dbFetchEnd = performance.now();

    if (result.error) {
        console.log(`[API] DB fetch failed after ${(dbFetchEnd - dbFetchStart).toFixed(2)} ms`);
        console.log(`[API] Total time: ${(performance.now() - totalStart).toFixed(2)} ms`);
        return json({ error: result.error }, { status: 400 });
    }

    const cacheSetStart = performance.now();
    await setCachedData(cacheKey, result.data, 36000);
    const cacheSetEnd = performance.now();

    const totalEnd = performance.now();
    console.log(`[API] DB fetch took ${(dbFetchEnd - dbFetchStart).toFixed(2)} ms`);
    console.log(`[API] Cache set took ${(cacheSetEnd - cacheSetStart).toFixed(2)} ms`);
    console.log(`[API] Total API time: ${(totalEnd - totalStart).toFixed(2)} ms`);

    return json(result.data, { status: 200 });
};
