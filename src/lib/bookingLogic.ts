import type {
  BookingDetails,
  BookingEntry,
  Closure,
  courtsType,
  CourtWithClosures,
  daySettingsType,
} from "../types/bookingTypes";
import { recurrenceEnum, courtStatusEnum } from "./constants/postgressFunctionConstants";
import { utcToMinutes, parseTimeStringToUTCMinutes, doIntervalsOverlap, occursAtRecurrence, addMinutesToUTCTimestamp } from "./utils/timeUtils";


// Not meant to be exported, for single use case ONLY
interface bookingConflictType  {
  attemptedCourtID: number;
  attemptedSubUnits: number[];
  attemptedStartMinutes: number;
  attemptedEndMinutes: number;
  attemptedDate: string;
}

export function ensureValidCredentialsForBooking(courts: courtsType, bookingJSON: BookingDetails): boolean {
  const selectedCourt = courts.find(c => c.courtID === bookingJSON.courtID)
  if (!selectedCourt) return false;
  if (!bookingJSON || !bookingJSON.units) return false;
  const subUnitIDs = selectedCourt.units?.find(u => u.unitID === bookingJSON.units.unitID)?.subUnits;  
  if (!subUnitIDs) return false;
  if (!bookingJSON.units.subUnits.every(su => subUnitIDs.some(su2 => su2.id === su.id))) return false; // all the booking subunit ids must exist within that subunit array
  return true;
}
// ------------------------- //
//     Master Validator      //
// ------------------------- //

export function hasBookingConflict(dayKey: string, daySettings: daySettingsType, bookings: BookingEntry[], attemptedBooking: bookingConflictType, allCourtsWithClosures: CourtWithClosures[]) {
  // TODO - remove bloated bookingEntry, and instead Booking entry where relevant, strip out BookingEntry wherever possible, and remove this ugly Mapping shit 
  const closureConflict = conflictWithinClosures(allCourtsWithClosures, attemptedBooking);
  const outsideHours = !withinOpenHours(daySettings, dayKey, attemptedBooking);
  const bookingConflict = conflictWithBookings(bookings.map(x => x.details), attemptedBooking);
  const flags = {bookingConflict, closureConflict, outsideHours}
  return {conflicts: ( bookingConflict || closureConflict || outsideHours),
      flags: Object.entries(flags).values()
  }
}


// --------------------------  //
//      Conflict checkers      //
// --------------------------  //
function conflictWithClosure( closure: Closure, attemptedBooking: bookingConflictType): boolean {
  const closureStartMinutes = utcToMinutes(closure.startTimestamp);
  const closureEndMinutes = closureStartMinutes + (closure.durationMinutes || 0);
  const closureEndTimeStamp = addMinutesToUTCTimestamp(closure.startTimestamp, closure.durationMinutes);
  const timeOverlap = closureStartMinutes < attemptedBooking.attemptedStartMinutes || attemptedBooking.attemptedEndMinutes < closureEndMinutes;
  const recurrenceMatch = occursAtRecurrence(closure.startTimestamp, closureEndTimeStamp, attemptedBooking.attemptedDate, closure.recurringType as recurrenceEnum);
  return timeOverlap && recurrenceMatch
}

function conflictWithinClosures(allClosures: CourtWithClosures[], attemptedBooking: bookingConflictType): boolean {
  const courtClosures = allClosures.find((c) => c.courtID === attemptedBooking.attemptedCourtID);
  if (!courtClosures || !courtClosures.closures.length) return false;
  return courtClosures.closures.some((closure) => conflictWithClosure( closure, attemptedBooking));
}

function withinOpenHours(daySettings: daySettingsType, dayKey: string, attemptedBooking: bookingConflictType): boolean {
  const key = dayKey.toLowerCase();
  const settings = daySettings[key];
  if (!settings?.is_day_bookable) return false;
  const open = parseTimeStringToUTCMinutes(settings.openTime!);
  const close = parseTimeStringToUTCMinutes(settings.closeTime!);
  return attemptedBooking.attemptedStartMinutes >= open && attemptedBooking.attemptedEndMinutes <= close;
}

function conflictWithBookings(bookings: BookingDetails[], attemptedBooking: bookingConflictType): boolean {
  // When a booking is archived, (when the owner updates the court details, say another unit is added or whatnot), they'd have different unitID's and/or may conflict with the current bookings. so for such bookings we ignore subunit overlap
  for (const booking of bookings) {
    const existingStart = utcToMinutes(booking.startTime);
    const existingEnd = utcToMinutes(booking.endTime);
    const overlap = doIntervalsOverlap(attemptedBooking.attemptedStartMinutes, attemptedBooking.attemptedEndMinutes, existingStart, existingEnd);
    const sameCourt = attemptedBooking.attemptedCourtID === booking.courtID;
    const subunitIDs = booking.units.subUnits?.map((su) => su.id) ?? [];
    const subunitOverlap = attemptedBooking.attemptedSubUnits.some((id) =>subunitIDs.includes(id)) ||  booking.courtStatus !== courtStatusEnum.APPROVED;
    if (sameCourt && overlap && subunitOverlap) return true;
  }
  return false;
}
