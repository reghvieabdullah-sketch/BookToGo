import { json, type RequestHandler } from "@sveltejs/kit";
import type { BookingDetails } from "../../../../types/bookingTypes";

/*
    is_conflicting_with_booking(p_venue_id bigint, p_attempted_booking_details jsonb)
 */

export const POST: RequestHandler = async ({ url, locals, request }) => {
    const supabase = locals.supabase;
    const formData = await request.formData();
    const bookingJSON = JSON.parse(formData.get('bookingFormData') as string) as BookingDetails;
    const venueID = url.searchParams.get("venue_id");
    if (!venueID) return json({ error: "Missing venue id" }, { status: 400 });
    if (!bookingJSON) return json({ error: "Missing booking JSON" }, { status: 400 });
    console.log(JSON.stringify(bookingJSON));
    const { data, error } = await supabase
        .rpc('is_conflicting_with_booking', { p_venue_id: venueID, p_attempted_booking_details: bookingJSON });
    error ? console.log(error) : {};
    return error
        ? json({ error: error.message }, { status: 500 })
        : json(data, { status: 200 });
};


export const GET: RequestHandler = async ({ url, locals }) => {
    const supabase = locals.supabase;
    const venueID = url.searchParams.get("venue_id");
    const dateStart = url.searchParams.get("date_start") as string;
    const dateEnd = url.searchParams.get("date_end") as string;
    if (!venueID) return json({ error: "Missing venue id" }, { status: 400 });
    // if (!dateStart || !dateEnd || new Date(dateStart) || new Date(dateEnd)) return json({ error: "invalid dates. pass with date_start, date_end" }, { status: 500 })
    const { data, error } = await supabase
        .rpc('get_bookings_by_day_for_venue', { p_venue_id: venueID, p_start_date: dateStart, p_end_date: dateEnd });
    return error
        ? json({ error: error.message }, { status: 500 })
        : json(data, { status: 200 });
};