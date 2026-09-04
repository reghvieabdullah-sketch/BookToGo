import { QUERY_PARAM_BOOKING_DASHBOARD_TYPE, QUERY_PARAM_VENUE_BOOKING_DATE_END, QUERY_PARAM_VENUE_BOOKING_DATE_START, QUERY_PARAM_VENUE_ID } from "$lib/constants/postgressFunctionConstants";
import { deleteBookingByID, getVenueBookingsForDateRange, getVenueBookingsForDateRangeAndDashboard, insertVenueBookingWithPossibilityCheck } from "$lib/dbFunctions/bookingsDB";
import { deleteCachedData, getCachedData, setCachedData } from "$lib/dbFunctions/cacheHandler";
import { json, type RequestHandler } from "@sveltejs/kit";
import { getStartEndDayOfTimeStamp } from "$lib/utils/timeUtils";
import type { BookingDetails } from "../../../../../types/bookingTypes";
import { updateBookingStatusByID } from "$lib/dbFunctions/venuesDB";

export const GET: RequestHandler = async ({ locals, params, url }) => {
    const { venueID } = params;
    const dateStart = url.searchParams.get(QUERY_PARAM_VENUE_BOOKING_DATE_START) as string;
    const dateEnd = url.searchParams.get(QUERY_PARAM_VENUE_BOOKING_DATE_END) as string;


    // Check if the owner request is present, we dont need to do auth checks, since postgres does it automatically
    if (!dateStart || !dateEnd) console.error('Invalid dates ', dateStart, ' ', dateEnd);
    if (QUERY_PARAM_BOOKING_DASHBOARD_TYPE in url.searchParams) return json(await getVenueBookingsForDateRangeAndDashboard(locals.supabase, venueID, dateStart, dateEnd));
    
    // const { startDate, endDate } = getStartEndDayOfTimeStamp(dateStart);
    // const cacheKey = `booking:${locals.venueURL}:${startDate.toISOString().split('T')[0]}:${endDate.toISOString().split('T')[0]}`;
    
    // const cached = await getCachedData(cacheKey);
    // if (cached) return json(cached)
    const result = await getVenueBookingsForDateRange(locals.supabase, venueID, dateStart, dateEnd);
    if (result.error) {
        return json({ error: result.error }, { status: 400 });
    }
    // await setCachedData(cacheKey, result.data)
    return json(result.data, { status: 200 });
};

export const PUT: RequestHandler = async ({ locals, request, params, url }) => {
    const { venueID } = params;
    const bookingJSON = await request.json() as BookingDetails;
    // const { startDate, endDate } = getStartEndDayOfTimeStamp(bookingJSON.startTime);
    // const cacheKey = [`booking:${locals.venueURL}:${startDate.toISOString().split('T')[0]}:${endDate.toISOString().split('T')[0]}` , `booking:${locals.venueURL}:${startDate.toISOString().split('T')[0]}:${endDate.toISOString().split('T')[0]}`];
    // console.warn("cacheKey: ", cacheKey);
    
    const result = await insertVenueBookingWithPossibilityCheck(locals.supabase, venueID!, locals.session?.user.id!, bookingJSON, locals.venueURL);
    if (result.error) {
        return json({ error: result.error }, { status: 400 });
    }
    // await deleteCachedData(cacheKey)
    return json(result.data, { status: 200 });
};

export const DELETE: RequestHandler = async ({ locals, request, params, url }) => {
    const { venueID } = params;
    const { bookingID } = await request.json();
    const result = await deleteBookingByID(locals.supabase, venueID, bookingID);
    if (result.error) {
        return json({ error: result.error }, { status: 400 });
    }
    return json(result.data, { status: 200 });
}

export const PATCH: RequestHandler = async ({ locals, request, params, url }) => {
    const { venueID } = params;
    const { bookingID, newStatus } = await request.json();
    const result = await updateBookingStatusByID(locals.supabase, venueID, bookingID, newStatus);
    if (result.error) {
        return json({ error: result.error }, { status: 400 });
    }
    return json(result.data, { status: 200 });
};