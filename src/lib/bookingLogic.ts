import { error } from "@sveltejs/kit";
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

export function ensureValidCredentialsForBooking(courts: courtsType, bookingJSON: BookingDetails, currency?: string): boolean | string {
  if (!bookingJSON || !bookingJSON.units || !currency) return false;
  const selectedCourt = courts.find(c => c.courtID === bookingJSON.courtID);
  if (!selectedCourt) return false;
  const subUnitIDs = selectedCourt.units?.find(u => u.unitID === bookingJSON.units.unitID)?.subUnits;
  if (!subUnitIDs) return false;
  const bookingSubUnits = bookingJSON.units.subUnits;
  if (!bookingSubUnits.length || !bookingSubUnits.every(su => subUnitIDs.some(su2 => su2.id === su.id))) return false;
  const commonObjects = bookingSubUnits.filter(su => subUnitIDs.some(su2 => su2.id === su.id));
  if (commonObjects.length === 0) return false;
  const totalPrice = commonObjects.reduce((sum, item) => {
    const price = Number(item.price);
    return isNaN(price) ? sum : sum + price;
  }, 0);
  return totalPrice > 0 ? `${currency}-${totalPrice}` : false;
}

// ------------------------- //
//     Master Validator      //
// ------------------------- //

export function hasBookingConflict(dayKey: string, daySettings: daySettingsType, bookings: BookingDetails[], attemptedBooking: bookingConflictType, allCourtsWithClosures: CourtWithClosures[]) {
  const closureConflict = conflictWithinClosures(allCourtsWithClosures, attemptedBooking);
  const outsideHours = !withinOpenHours(daySettings, dayKey, attemptedBooking);
  const bookingConflict = conflictWithBookings(bookings, attemptedBooking);
  const flags = {bookingConflict, closureConflict, outsideHours}
  return {
      conflicts: bookingConflict || closureConflict || outsideHours,
      flags
  };
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
    try{
    const existingStart = utcToMinutes(booking.startTime);
    const existingEnd = utcToMinutes(booking.endTime);
    const overlap = doIntervalsOverlap(attemptedBooking.attemptedStartMinutes, attemptedBooking.attemptedEndMinutes, existingStart, existingEnd);
    const sameCourt = attemptedBooking.attemptedCourtID === booking.courtID;
    const subunitIDs = booking.units.subUnits?.map((su) => su.id) ?? [];
    const subunitOverlap = attemptedBooking.attemptedSubUnits.some((id) =>subunitIDs.includes(id)) ||  booking.courtStatus !== courtStatusEnum.APPROVED;
    if (sameCourt && overlap && subunitOverlap) return true;
    } catch(e){
      // console.log(booking);
      return false;
    }
  }
  
  return false;
}
