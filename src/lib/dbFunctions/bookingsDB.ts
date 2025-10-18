import type { BookingDetails, BookingEntry } from "../../types/bookingTypes";
import type { SupabaseClient } from "@supabase/supabase-js";
import { FN_BOOKING_CLOSURE_GET, FN_VENUE_BOOKING_GET, FN_VENUE_BOOKING_INSERT, FN_VENUE_BOOKING_INSERT_WITHOUT_CHECK, FN_VENUE_BOOKING_LIMIT, FN_VENUE_USER_BOOKINGS_GET } from "$lib/constants/postgressFunctionConstants";
import { hasBookingConflict } from "$lib/bookingLogic";
import { getVenueSettings } from "./venuesDB";
import { HHMMToMinutes, timeStampToDateString, timeStampToDayKey } from "$lib/utils/timeUtils";

// Common return type for DB operations
type DBResult<T> = { data: T | null; error: string | null };


async function runRPC<T>( supabase: SupabaseClient, fn: string, params: Record<string, any>, errorPrefix = ""){
    const { data, error } = await supabase.rpc(fn, params);
    if (error) return { data: null, error: `${errorPrefix ?? 'Error'}-${error}`}
    return { data, error: null };
}

function ensureArgs(args: Record<string, any>): string | null {
    for (const [key, value] of Object.entries(args)) if (!value) return `Missing ${key}`
    return null;
}


/**Inserts a venue specific booking. No auth or type/null checks done.*/
export async function insertVenueBooking(supabase: SupabaseClient, venueID: string | undefined, bookingJSON: BookingDetails): Promise<DBResult<any>> {
    console.warn('Legacy | please switch over to the new insertVenueBookingWithPossibilityCheck function.')
    const missing = ensureArgs({ venueID, bookingJSON })
    if (missing) return { data: null, error: missing};
    return runRPC(supabase, FN_VENUE_BOOKING_INSERT, { p_venue_id: venueID, p_attempted_booking: bookingJSON})
}

export async function userBookingPastLimit(supabase: SupabaseClient, venueID: string | undefined, userID: string | undefined): Promise<DBResult<any>> {
    const missing = ensureArgs({venueID, userID})
    if (missing) return { data: null, error: missing };
    return runRPC(supabase, FN_VENUE_BOOKING_LIMIT, {p_venue_id: venueID, p_user_id: userID});
}

/** This version of the insert function checks if the booking is possible as well. before inserting */
export async function insertVenueBookingWithPossibilityCheck(supabase: SupabaseClient, venueID: string, userID: string, bookingJSON: BookingDetails): Promise<DBResult<any>> {
  const missing = ensureArgs({ venueID, userID, bookingJSON });
  if (missing) return { data: null, error: missing };
  const [limitRes, settingRes, bookingRes] = await Promise.all([
    userBookingPastLimit(supabase, venueID, userID),
    getVenueSettings(supabase, venueID),
    getBookingClosureBundle(
      supabase,
      venueID,
      `${bookingJSON.startTime.split("T")[1]}T00:00:00Z`,
      `${bookingJSON.endTime.split("T")[1]}T23:59:59Z`
    ),
  ]);

  if (limitRes.error || limitRes.data) return { data: null, error: limitRes.error || "Past limits" };
  if (bookingRes.error) return bookingRes;
  if (settingRes.error || !settingRes.data?.daySettings) return settingRes;

  const start = HHMMToMinutes(bookingJSON.startTime.split("T")[1]);
  const end = HHMMToMinutes(bookingJSON.endTime.split("T")[1]);
  if (end < start) return { data: null, error: "Multi-day booking not supported." };
  const conflict = hasBookingConflict(timeStampToDayKey(bookingJSON.startTime), settingRes.data.daySettings, bookingJSON.courtID, bookingJSON.units.map((x) => x.unitID), start, end, Object.values(bookingRes.data.bookingData ?? {}).flat() as BookingEntry[], timeStampToDateString(bookingJSON.startTime), bookingRes.data.closureData);
  if (conflict) return { data: false, error: null };
  return runRPC(supabase, FN_VENUE_BOOKING_INSERT_WITHOUT_CHECK, {
    p_venue_id: venueID,
    p_attempted_booking: bookingJSON,
    p_user_id: userID,
  });
}


/**Gets a specific venue's booking by date range. No auth or type/null checks done.*/
export async function getVenueBookingsForDateRange(supabase: SupabaseClient, venueID: string | undefined, dateStart: string, dateEnd: string): Promise<DBResult<any>> {
    const missing = ensureArgs({ p_venue_id: venueID, p_start_date: dateStart, p_end_date: dateEnd});
    if (missing) return { data: null, error: missing };
    return runRPC(supabase, FN_VENUE_BOOKING_GET, {p_venue_id: venueID, p_start_date: dateStart, p_end_date: dateEnd});
}

export async function getBookingClosureBundle(supabase: SupabaseClient, venueID: string | undefined, dateStart: string, dateEnd: string): Promise<DBResult<any>> {
    const missing = ensureArgs({ p_venue_id: venueID, p_start_date: dateStart, p_end_date: dateEnd });
    if (missing) return { data: null, error: missing};
    return runRPC(supabase, FN_BOOKING_CLOSURE_GET, { p_venue_id: venueID, p_start_date: dateStart, p_end_date: dateEnd })
}



/** Returns the users bookings. But if its the owner, return all the bookings, if he somehow manages to navigate to /mybookings*/
export async function getUserBookings(supabase: SupabaseClient, venueID: string | undefined): Promise<DBResult<any>> {
    const missing = ensureArgs({ p_venue_id: venueID})
    if (missing) return { data: null, error: missing };
    return runRPC(supabase, FN_VENUE_USER_BOOKINGS_GET, { p_venue_id: venueID })
}