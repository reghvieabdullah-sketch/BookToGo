import type {
  BookingDetails,
  BookingEntry,
  Closure,
  CourtWithClosures,
  daySettingsType,
} from "../types/bookingTypes";
import { recurrenceEnum, courtStatusEnum } from "./constants/postgressFunctionConstants";
import { utcToMinutes, parseTimeStringToUTCMinutes, doIntervalsOverlap, occursAtRecurrence } from "./utils/timeUtils";



// -------------------------
// Master Validator
// -------------------------
export function hasBookingConflict(dayKey: string, daySettings: daySettingsType, attemptedCourtID: number, attemptedSubUnits: number[], attemptedStartMinutes: number, attemptedEndMinutes: number, bookings: BookingEntry[], attemptedDate: string,allCourtsWithClosures: CourtWithClosures[]) {
  const closureConflict = conflictWithinClosures(allCourtsWithClosures, attemptedCourtID, attemptedStartMinutes, attemptedEndMinutes, attemptedDate);
  const outsideHours = !withinOpenHours(daySettings, dayKey, attemptedStartMinutes, attemptedEndMinutes);

  if (outsideHours) return true;
  if (!closureConflict && !bookings) return false;

  const approved = bookings.filter((b) => b.details.courtStatus === courtStatusEnum.APPROVED).map((b) => b.details);
  const archived = bookings.filter((b) => b.details.courtStatus === courtStatusEnum.ARCHIVED).map((b) => b.details);

  const currentConflict = conflictWithBookings(approved, attemptedStartMinutes, attemptedEndMinutes, attemptedCourtID, attemptedSubUnits);
  const archivedConflict = conflictWithBookings(archived, attemptedStartMinutes, attemptedEndMinutes, attemptedCourtID, attemptedSubUnits);
  
  return (currentConflict || archivedConflict || closureConflict || outsideHours)
}



// -------------------------
// Conflict checkers
// -------------------------

function conflictWithClosure( closure: Closure, attemptedStart: number, attemptedEnd: number, attemptedDateString: string): boolean {
  const closureStartMinutes = utcToMinutes(closure.startTimestamp);
  const closureEndMinutes = closureStartMinutes + (closure.durationMinutes || 0);
  const timeOverlap = doIntervalsOverlap( attemptedStart, attemptedEnd, closureStartMinutes, closureEndMinutes);
  const recurrenceMatch = occursAtRecurrence(closure.startTimestamp, attemptedDateString, closure.recurringType as recurrenceEnum);

  return timeOverlap && recurrenceMatch;
}

function conflictWithinClosures(allClosures: CourtWithClosures[], attemptedCourtID: number, attemptedStart: number, attemptedEnd: number, attemptedDate: string): boolean {
  const courtClosures = allClosures.find((c) => c.courtID === attemptedCourtID);
  if (!courtClosures || !courtClosures.closures.length) return false;
  return courtClosures.closures.some((closure) => conflictWithClosure( closure, attemptedStart, attemptedEnd, attemptedDate));
}

function withinOpenHours(daySettings: daySettingsType, dayKey: string, startMinutes: number, endMinutes: number): boolean {
  const key = dayKey.toLowerCase();
  const settings = daySettings[key];

  if (!settings?.is_day_bookable) return false;

  const open = parseTimeStringToUTCMinutes(settings.openTime!);
  const close = parseTimeStringToUTCMinutes(settings.closeTime!);

  return startMinutes >= open && endMinutes <= close;
}

function conflictWithBookings(bookings: BookingDetails[], attemptedStart: number, attemptedEnd: number, attemptedCourtID: number, attemptedSubUnitIDs: number[]): boolean {
  for (const booking of bookings) {
    const existingStart = utcToMinutes(booking.startTime);
    const existingEnd = utcToMinutes(booking.endTime);
    const sameCourt = attemptedCourtID === booking.courtID;
    const overlap = doIntervalsOverlap(attemptedStart, attemptedEnd, existingStart, existingEnd);
    const subunitIDs = booking.units[0]?.subUnits?.map((su) => su.id) ?? [];
    const subunitOverlap = attemptedSubUnitIDs.some((id) =>subunitIDs.includes(id));

    if (sameCourt && overlap && subunitOverlap) return true;
  }

  return false;
}


