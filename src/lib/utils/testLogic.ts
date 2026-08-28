import { hasBookingConflict } from "$lib/bookingLogic";
import { getVenueBundled } from "$lib/dbFunctions/venuesDB";
import type { SupabaseClient } from "@supabase/supabase-js";
import type { BookingDetails } from "../../types/bookingTypes";

import { createClient } from '@supabase/supabase-js';
import { timeStampToDayKey, timeStampToDateString, HHMMToMinutes } from "./timeUtils";
import { userBookingPastLimit, getBookingClosureBundle } from "$lib/dbFunctions/bookingsDB";

const supabase = createClient(
    "https://nggnpugivucqjmawwfzm.supabase.co",
    "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im5nZ25wdWdpdnVjcWptYXd3ZnptIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Nzk3ODIxMDEsImV4cCI6MjA5NTM1ODEwMX0.H0hUEZPq96yzLSNpjmo-gMkjCirbJ8Z30IqhGLpHut4"
);

async function testHasBookingConflict(venueID: string, userID: string, bookingJSON: BookingDetails, supabase: SupabaseClient, venueURL: string) {
    // load test data from API. TEMPORARY: replace with mock data for unit testing

      const [limitRes, venueRes, bookingRes] = await Promise.all([
        userBookingPastLimit(supabase, venueID, userID),
        getVenueBundled(supabase, venueURL),
        getBookingClosureBundle(
          supabase,
          venueID,
          `${bookingJSON.startTime.split("T")[0]}T00:00:00Z`,
          `${bookingJSON.endTime.split("T")[0]}T23:59:59Z`, false
        ),
      ]);
    

    const conflictHandler = hasBookingConflict(timeStampToDayKey(bookingJSON.startTime), venueRes.data.settingsData.daySettings, Object.values(bookingRes.data.bookingData ?? {}).flat() as BookingDetails[], bookingJSON, bookingRes.data.closureData)
    console.log(conflictHandler.flags);
    if (conflictHandler.conflicts) console.log("Booking conflicts detected!");
      
}


// test

const testBooking: BookingDetails = {
    "courtStatus": "approved",
    "courtID": 32,
    "startTime": "2026-08-31T03:30:00.000Z",
    "endTime": "2026-08-31T04:30:00.000Z",
    "status": "pending",
    "units": {
        "title": "Half Court",
        "unitID": 58,
        "subUnits": [
            {
                "id": 89,
                "price": 2500,
                "description": "Half Court A"
            },
            {
                "id": 90,
                "price": 2500,
                "description": "Half Court B"
            }
        ]
    }
};


testHasBookingConflict("1", "92b8a584-287a-4bb8-9c6d-aa2e95507e77", testBooking, supabase, "stmarybball");