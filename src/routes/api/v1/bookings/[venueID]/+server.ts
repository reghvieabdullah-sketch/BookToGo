import { QUERY_PARAM_VENUE_BOOKING_DATE_END, QUERY_PARAM_VENUE_BOOKING_DATE_START, QUERY_PARAM_VENUE_ID } from "$lib/constants/postgressFunctionConstants";
import { getVenueBookingsForDateRange, insertVenueBooking } from "$lib/dbFunctions/bookingsDB";
import type { RequestHandler } from "@sveltejs/kit";

export const GET: RequestHandler = async ({ locals, params, url }) => {
    const { venueID } = params;
    const dateStart = url.searchParams.get(QUERY_PARAM_VENUE_BOOKING_DATE_START) as string;
    const dateEnd = url.searchParams.get(QUERY_PARAM_VENUE_BOOKING_DATE_END) as string;
    return getVenueBookingsForDateRange(locals.supabase, venueID, dateStart, dateEnd);
};

export const PUT: RequestHandler = async ({ locals, request, params }) => {
    const { venueID } = params;
    const bookingJSON = await request.json();
    return insertVenueBooking(locals.supabase, venueID, bookingJSON)
};