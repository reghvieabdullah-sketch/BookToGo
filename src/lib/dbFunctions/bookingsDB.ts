import type { BookingDetails } from "../../types/bookingTypes";
import type { SupabaseClient } from "@supabase/supabase-js";
import { FN_BOOKING_CLOSURE_GET, FN_VENUE_BOOKING_GET, FN_VENUE_BOOKING_INSERT } from "$lib/constants/postgressFunctionConstants";
import { json } from "@sveltejs/kit";


/**Inserts a venue specific booking. No auth or type/null checks done.*/
export async function insertVenueBooking(supabase: SupabaseClient, venueID: string | undefined, bookingJSON: BookingDetails): Promise<Response> {
    if (!venueID) return json({ error: "Missing venue id" }, { status: 400 });
    if (!bookingJSON) return json({ error: "Missing booking JSON" }, { status: 400 });
    console.log(JSON.stringify(bookingJSON, null, 2));
    
    const { data, error } = await supabase
        .rpc(FN_VENUE_BOOKING_INSERT, { p_venue_id: venueID, p_attempted_booking: bookingJSON });
    return error
        ? json({ error: error.message }, { status: 500 })
        : json(data, { status: 200 });
};

/**Gets a specific venue's booking by date range. No auth or type/null checks done.*/
export async function getVenueBookingsForDateRange(supabase: SupabaseClient, venueID: string | undefined, dateStart: string, dateEnd: string): Promise<Response> {
    if (!venueID) return json({ error: "Missing venue id" }, { status: 400 });
    if (!dateStart || !dateEnd) return json({ error: "invalid dates. pass with date_start, date_end" }, { status: 500 })
    const { data, error } = await supabase
        .rpc(FN_VENUE_BOOKING_GET, { p_venue_id: venueID, p_start_date: dateStart, p_end_date: dateEnd });
    return error
        ? json({ error: error.message }, { status: 500 })
        : json(data, { status: 200 });
};


export async function getBookingClosureBundle(supabase: SupabaseClient, venueID: string | undefined, dateStart: string, dateEnd: string): Promise<Response> {
    if (!venueID) return json({ error: "Missing closure id" }, { status: 400 });
    const { data, error } = await supabase
        .rpc(FN_BOOKING_CLOSURE_GET, { p_venue_id: venueID, p_start_date: dateStart, p_end_date: dateEnd });
    return error
        ? json({ error: error.message }, { status: 500 })
        : json(data, { status: 200 });
}