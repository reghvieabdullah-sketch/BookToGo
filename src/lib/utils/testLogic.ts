import { hasBookingConflict } from "$lib/bookingLogic";
import { getVenueBundled } from "$lib/dbFunctions/venuesDB";
import type { SupabaseClient } from "@supabase/supabase-js";
import type { BookingDetails } from "../../types/bookingTypes";

import { createClient } from '@supabase/supabase-js';
import { timeStampToDayKey, timeStampToDateString, HHMMToMinutes } from "./timeUtils";
import { userBookingPastLimit, getBookingClosureBundle } from "$lib/dbFunctions/bookingsDB";

const supabase = createClient(
    "https://girygvjwrdgdinbljcfu.supabase.co",
    "sb_publishable_UluMQJz8t2GPf5XKN3tWEQ_8cf1yFXY"
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
    
    //   console.log(bookingRes.data);
      

    const conflictHandler = hasBookingConflict(timeStampToDayKey(bookingJSON.startTime), venueRes.data.settingsData.daySettings, Object.values(bookingRes.data.bookingData ?? {}).flat() as BookingDetails[], bookingJSON, bookingRes.data.closureData)
    // console.log(conflictHandler.flags);
    if (conflictHandler.conflicts) console.log("Booking conflicts detected!");
      
}


// test

const testBooking: BookingDetails = {
    "courtStatus": "approved",
    "courtID": 1,
    "startTime": "2026-09-03T05:00:00.000Z", // closure starts at 5 and ends at 6
    "endTime": "2026-09-03T06:00:00.000Z", // so if the bookingEndTime between closureStart and closureEnd. Or if the closureStartTime < bookingStartTime < closureEndTime. Or if the bookingStart < closureStartTime and bookingEnd > 6. Then it should be a conflict. 
    "status": "pending",
    "units": {
        "title": "Full Court",
        "unitID": 1,
        "subUnits": [
            {
                "id": 1,
                "price": 2000,
                "description": "1 hour"
            }
        ]
    }

};


testHasBookingConflict("1", "", testBooking, supabase, "example");












const toLocalTime = (timeString?: string | null): string => {
	if (!timeString) return "";

	// Convert +00 / -05 / +0530 → +00:00 / -05:00 / +05:30
	const normalized = timeString.replace(
		/([+-])(\d{2})(?::?(\d{2}))?$/,
		(_, sign, hours, minutes = "00") =>
			`${sign}${hours}:${minutes}`
	);

	const date = new Date(`1970-01-01T${normalized}`);

	if (Number.isNaN(date.getTime())) return "";

	return date.toLocaleTimeString([], {
		hour: "2-digit",
		minute: "2-digit",
		hour12: true,
	});
};


// console.log(toLocalTime("08:00:00+00"));
