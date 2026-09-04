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

export function hasBookingConflict(dayKey: string, daySettings: daySettingsType, bookings: BookingDetails[], attemptedBooking: BookingDetails, allCourtsWithClosures: CourtWithClosures[]) {
  const closureConflict = conflictWithinClosures(allCourtsWithClosures, attemptedBooking);
  const outsideHours = !withinOpenHours(daySettings, dayKey, attemptedBooking);
  const bookingConflict = conflictWithBookings(bookings, attemptedBooking);
  const isPastTime = new Date(attemptedBooking.startTime) < new Date();
  const flags = {bookingConflict, closureConflict, outsideHours, isPastTime};
  return {
      conflicts: bookingConflict || closureConflict || outsideHours || isPastTime,
      flags
  };
}


// --------------------------  //
//      Conflict checkers      //
// --------------------------  //
function conflictWithClosure(
    closure: Closure,
    attemptedBooking: BookingDetails
): boolean {
    const closureStartMinutes = utcToMinutes(closure.startTimestamp);
    const closureEndTimeStamp = addMinutesToUTCTimestamp(
        closure.startTimestamp,
        closure.durationMinutes
    );
    const closureEndMinutes =
        closureStartMinutes + (closure.durationMinutes || 0);

    const bookingStartMinutes = utcToMinutes(attemptedBooking.startTime);
    const bookingEndMinutes = utcToMinutes(attemptedBooking.endTime);

    const timeOverlap =
        bookingStartMinutes < closureEndMinutes &&
        bookingEndMinutes > closureStartMinutes;

    const recurrenceMatch = occursAtRecurrence(
        closure.startTimestamp,
        closureEndTimeStamp,
        attemptedBooking.startTime.split('T')[0],
        closure.recurringType as recurrenceEnum
    );

    return timeOverlap && recurrenceMatch;
}

function conflictWithinClosures(allClosures: CourtWithClosures[], attemptedBooking: BookingDetails): boolean {
  const courtClosures = allClosures.find((c) => c.courtID === attemptedBooking.courtID);
  if (!courtClosures || !courtClosures.closures.length) return false;
  return courtClosures.closures.some((closure) => conflictWithClosure( closure, attemptedBooking));
}

function withinOpenHours(daySettings: daySettingsType, dayKey: string, attemptedBooking: BookingDetails): boolean {
  const key = dayKey.toLowerCase();
  const settings = daySettings[key];
  if (!settings?.is_day_bookable) return false;
  const open = parseTimeStringToUTCMinutes(settings.openTime!);
  const close = parseTimeStringToUTCMinutes(settings.closeTime!);
  return utcToMinutes(attemptedBooking.startTime) >= open && utcToMinutes(attemptedBooking.endTime) <= close;
}

function conflictWithBookings(bookings: BookingDetails[], attemptedBooking: BookingDetails): boolean {
  // When a booking is archived, (when the owner updates the court details, say another unit is added or whatnot), they'd have different unitID's and/or may conflict with the current bookings. so for such bookings we ignore subunit overlap

  for (const booking of bookings) {
    try{
    const existingStart = utcToMinutes(booking.startTime);
    const existingEnd = utcToMinutes(booking.endTime);
    const overlap = doIntervalsOverlap(utcToMinutes(attemptedBooking.startTime), utcToMinutes(attemptedBooking.endTime), existingStart, existingEnd);
    const sameCourt = attemptedBooking.courtID === booking.courtID; // the latter check is in place, since courtID's are different even for the same booking, so we have to outright not allow it
    const conflictingWithArchivedBooking = booking.courtStatus !== courtStatusEnum.APPROVED;
    const subunitIDs = booking.units.subUnits?.map((su) => su.id) ?? [];
    const subunitOverlap = attemptedBooking.units.subUnits?.some((sunit) =>subunitIDs.includes(sunit.id)) ||  booking.courtStatus !== courtStatusEnum.APPROVED;
    if (sameCourt && overlap && booking.units.unitID !== attemptedBooking.units.unitID) return true; // if the unitID's are different, then the booking is archived and we ignore subunit overlap
    if (sameCourt && overlap && subunitOverlap) return true;
    if (overlap && conflictingWithArchivedBooking) return true;
    } catch(e){
      console.log(e);
      return true;
    }
  }
  
  return false;
}
