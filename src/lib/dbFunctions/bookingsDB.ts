import type { BookingDetails } from "../../types/bookingTypes";
import type { SupabaseClient } from "@supabase/supabase-js";
import { FN_BOOKING_CLOSURE_GET, FN_VENUE_BOOKING_GET, FN_VENUE_BOOKING_INSERT, FN_VENUE_USER_BOOKINGS_GET } from "$lib/constants/postgressFunctionConstants";

// Common return type for DB operations
type DBResult<T> = { data: T | null; error: string | null };

/**Inserts a venue specific booking. No auth or type/null checks done.*/
export async function insertVenueBooking(supabase: SupabaseClient, venueID: string | undefined, bookingJSON: BookingDetails): Promise<DBResult<any>> {
    if (!venueID) return { data: null, error: "Missing venue id" };
    if (!bookingJSON) return { data: null, error: "Missing booking JSON" };
    console.log(JSON.stringify(bookingJSON, null, 2));

    const { data, error } = await supabase
        .rpc(FN_VENUE_BOOKING_INSERT, { p_venue_id: venueID, p_attempted_booking: bookingJSON });
    return error
        ? { data: null, error: error.message }
        : { data, error: null };
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