import { QUERY_PARAM_BOOKING_INSERT_WITH_CHECK, QUERY_PARAM_VENUE_BOOKING_DATE_END, QUERY_PARAM_VENUE_BOOKING_DATE_START, QUERY_PARAM_VENUE_ID } from "$lib/constants/postgressFunctionConstants";
import { getVenueBookingsForDateRange, insertVenueBooking, insertVenueBookingWithPossibilityCheck } from "$lib/dbFunctions/bookingsDB";
import { deleteCachedData, getCachedData, setCachedData } from "$lib/dbFunctions/cacheHandler";
import { json, type RequestHandler } from "@sveltejs/kit";
import type { BookingDetails } from "../../../../../types/bookingTypes";
import { getStartEndDayOfTimeStamp } from "$lib/utils/timeUtils";

export const GET: RequestHandler = async ({ locals, params, url }) => {
    const { venueID } = params;
    const dateStart = url.searchParams.get(QUERY_PARAM_VENUE_BOOKING_DATE_START) as string;
    const dateEnd = url.searchParams.get(QUERY_PARAM_VENUE_BOOKING_DATE_END) as string;

    if (!dateStart || !dateEnd) console.error('Invalid dates ', dateStart, ' ', dateEnd);
    
    const cacheKey = `booking:${locals.venueURL}:${dateStart}:${dateEnd}`;

    const cached = await getCachedData(cacheKey);
    if (cached) return json(cached)
    const result = await getVenueBookingsForDateRange(locals.supabase, venueID, dateStart, dateEnd);
    if (result.error) {
        return json({ error: result.error }, { status: 400 });
    }
    await setCachedData(cacheKey, result.data)
    return json(result.data, { status: 200 });
};

export const PUT: RequestHandler = async ({ locals, request, params, url }) => {
    const { venueID } = params;
    const bookingJSON = await request.json() as BookingDetails;
    const { startDate, endDate } = getStartEndDayOfTimeStamp(bookingJSON.startTime);
    const cacheKey = [`booking:${locals.venueURL}:${startDate.toISOString()}:${endDate.toISOString()}` , `bookingclosures:${locals.venueURL}:bundled`];
    const result = await insertVenueBookingWithPossibilityCheck(locals.supabase, venueID!, locals.session?.user.id!, bookingJSON, locals.venueURL);
    if (result.error) {
        return json({ error: result.error }, { status: 400 });
    }
    await deleteCachedData(cacheKey)
    return json(result.data, { status: 200 });
};