import { QUERY_PARAM_VENUE_BOOKING_DATE_END, QUERY_PARAM_VENUE_BOOKING_DATE_START } from "$lib/constants/postgressFunctionConstants";
import { getBookingClosureBundle } from "$lib/dbFunctions/bookingsDB";
import { json, type RequestHandler } from "@sveltejs/kit";

export const GET: RequestHandler = async ({ url, params, locals }) => {
    // Got rid of caching here. its hard to jumble closures
    const { venueID } = params;
    const dateStart = url.searchParams.get(QUERY_PARAM_VENUE_BOOKING_DATE_START) as string;
    const dateEnd = url.searchParams.get(QUERY_PARAM_VENUE_BOOKING_DATE_END) as string;
    const result = await getBookingClosureBundle(locals.supabase, venueID, dateStart, dateEnd);
    console.warn(result);
    if (result.error) return json({ error: result.error }, { status: 400 });
    return json(result.data, { status: 200 });
};
