import type { BookingDetails } from "../../types/bookingTypes";
import type { SupabaseClient } from "@supabase/supabase-js";
import { FN_BOOKING_CLOSURE_GET, FN_VENUE_BOOKING_GET, FN_VENUE_BOOKING_INSERT, FN_VENUE_USER_BOOKINGS_GET } from "$lib/constants/postgressFunctionConstants";
import { error } from "@sveltejs/kit";
import { hasBookingConflict } from "$lib/bookingLogic";
import { getVenueSettings } from "./venuesDB";
import { HHMMToMinutes } from "$lib/utils/timeUtils";
import { dayNamesFull } from "$lib/constants/dayMonthconstants";

// Common return type for DB operations
type DBResult<T> = { data: T | null; error: string | null };

/**Inserts a venue specific booking. No auth or type/null checks done.*/
export async function insertVenueBooking(supabase: SupabaseClient, venueID: string | undefined, bookingJSON: BookingDetails): Promise<DBResult<any>> {
    console.warn('Legacy | please switch over to the new insertVenueBookingWithPossibilityCheck function.')
    if (!venueID) return { data: null, error: "Missing venue id" };
    if (!bookingJSON) return { data: null, error: "Missing booking JSON" };
    const { data, error } = await supabase
        .rpc(FN_VENUE_BOOKING_INSERT, { p_venue_id: venueID, p_attempted_booking: bookingJSON });
    return error
        ? { data: null, error: error.message }
        : { data, error: null };
}

/** This version of the insert function checks if the booking is possible as well. before inserting */
export async function insertVenueBookingWithPossibilityCheck(supabase: SupabaseClient, venueID: string | undefined, bookingJSON: BookingDetails): Promise<DBResult<any>> {
    // Despite the improvement in scalablity and version control, a false positive may get returned since both the server and client uses the same checks to validation the code. Thus its necessary to maintain the integrity of the checks, since any bugs would result in catastrophic bugs
    // The previous function completely avoided this by also making the database check for availability, and also saving network round trips.
    if (!venueID) return { data: null, error: "Missing venue id" };
    if (!bookingJSON) return { data: null, error: "Missing booking JSON" };
    // We assume that the bookingJSON is sent in ISO format
    // Since redis isnt used here. we can reduce checks + calls by passing in the start and end time
    // get the bookings
    const bookingResponse = await getBookingClosureBundle(supabase, venueID, bookingJSON.startTime, bookingJSON.endTime)
    const settingResponse = await getVenueSettings(supabase, venueID)
 
    if (bookingResponse.error) return bookingResponse;
    if (settingResponse.error || !settingResponse.data?.daySettings) return settingResponse;
    if (!bookingResponse.data || bookingResponse?.data?.length < 1) return { data: true, error: null}
    const dayKey = new Date(bookingJSON.startTime);

    // Booking limited to single day bookings only.
    const startTime = HHMMToMinutes(bookingJSON.startTime.split('T')[0])
    const endTime = HHMMToMinutes(bookingJSON.endTime.split('T')[0])

    if (endTime < startTime) return { data: null, error: 'Multi-day booking not supported.'}
    
    // hardcoded to follow 'bookingData and closureData'
    const isoDayIndex = ((new Date(bookingJSON.startTime).getUTCDay() + 6) % 7) + 1; // 1=Mon … 7=Sun
    const days = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'];
    const conflicts = (hasBookingConflict(dayNamesFull[isoDayIndex - 1], settingResponse.data?.daySettings, bookingJSON.courtID, bookingJSON.units.map(x => x.unitID), startTime, endTime, bookingResponse.data.bookingData, dayKey.toDateString(), bookingResponse.data.closureData))
    // console log temporarily
    console.log('checking booking possibility, ', bookingJSON, '\n and got that it ', (conflicts ? 'conflicted' : 'went thru'));
    return { data: conflicts, error: null}

}

/**Gets a specific venue's booking by date range. No auth or type/null checks done.*/
export async function getVenueBookingsForDateRange(supabase: SupabaseClient, venueID: string | undefined, dateStart: string, dateEnd: string): Promise<DBResult<any>> {
    if (!venueID) return { data: null, error: "Missing venue id" };
    if (!dateStart || !dateEnd) return { data: null, error: "Invalid dates. pass with date_start, date_end" };

    const { data, error } = await supabase
        .rpc(FN_VENUE_BOOKING_GET, { p_venue_id: venueID, p_start_date: dateStart, p_end_date: dateEnd });
    return error
        ? { data: null, error: error.message }
        : { data, error: null };
}

export async function getBookingClosureBundle(supabase: SupabaseClient, venueID: string | undefined, dateStart: string, dateEnd: string): Promise<DBResult<any>> {
    if (!venueID) return { data: null, error: "Missing venue id" };

    const { data, error } = await supabase
        .rpc(FN_BOOKING_CLOSURE_GET, { p_venue_id: venueID, p_start_date: dateStart, p_end_date: dateEnd });
    return error
        ? { data: null, error: error.message }
        : { data, error: null };
}



/** Returns the users bookings. But if its the owner, return all the bookings, if he somehow manages to navigate to /mybookings*/
export async function getUserBookings(supabase: SupabaseClient, venueID: string | undefined): Promise<DBResult<any>> {
    if (!venueID) return { data: null, error: "Missing venue id" };
    const { data, error } = await supabase
        .rpc(FN_VENUE_USER_BOOKINGS_GET, { p_venue_id: venueID });
    return error
        ? { data: null, error: error.message }
        : { data, error: null };
}