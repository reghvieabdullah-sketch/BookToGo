import { QUERY_PARAM_VENUE_BOOKING_DATE_END, QUERY_PARAM_VENUE_BOOKING_DATE_START } from "$lib/constants/postgressFunctionConstants";
import { getBookingClosureBundle } from "$lib/dbFunctions/bookingsDB";
import type { RequestHandler } from "@sveltejs/kit";

export const GET: RequestHandler = async ({ url, params, locals }) => {
    const { venueID } = params;
    const dateStart = url.searchParams.get(QUERY_PARAM_VENUE_BOOKING_DATE_START) as string;
    const dateEnd = url.searchParams.get(QUERY_PARAM_VENUE_BOOKING_DATE_END) as string;
    return getBookingClosureBundle(locals.supabase, venueID, dateStart, dateEnd);
};