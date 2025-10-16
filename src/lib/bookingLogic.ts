// bookingValidator.ts
// Clean, modular, timezone-safe booking conflict checker

import type {
  BookingDetails,
  BookingEntry,
  Closure,
  CourtWithClosures,
  daySettingsType,
} from "../types/bookingTypes";
import { recurrenceEnum, courtStatusEnum } from "./constants/postgressFunctionConstants";

// -------------------------
// Time + Date Utilities
// -------------------------

/**
 * Converts a UTC timestamp to minutes of local day.
 * (e.g. 08:30 local => 510)
 */
function utcToLocalMinutes(utcString: string): number {
  const dt = new Date(utcString);
  return dt.getHours() * 60 + dt.getMinutes(); // Local hours/minutes
}

/**
 * Converts "HH:MM[:SS]" to total minutes.
 */
function parseHHMMToMinutes(timeString: string, delimiter = ":"): number {
  const [h, m] = timeString.split(delimiter).map(Number);
  return h * 60 + m;
}

/**
 * True if two intervals [startA, endA) and [startB, endB) overlap
 */
function doIntervalsOverlap(
  startA: number,
  endA: number,
  startB: number,
  endB: number
): boolean {
  return startA < endB && endA > startB;
}

// -------------------------
// Recurrence logic
// -------------------------

function occursAtRecurrence(
  closureDate: Date,
  attemptedDate: Date,
  recurrenceType: recurrenceEnum | string
): boolean {
  const type =
    typeof recurrenceType === "string"
      ? recurrenceType
      : recurrenceType.valueOf();

  switch (type) {
    case recurrenceEnum.DAILY:
      return true;
    case recurrenceEnum.WEEKLY:
      return closureDate.getDay() === attemptedDate.getDay();
    case recurrenceEnum.MONTHLY:
      return closureDate.getDate() === attemptedDate.getDate();
    case recurrenceEnum.YEARLY:
      return (
        closureDate.getDate() === attemptedDate.getDate() &&
        closureDate.getMonth() === attemptedDate.getMonth()
      );
    case recurrenceEnum.ONCE:
      return closureDate.toDateString() === attemptedDate.toDateString();
    default:
      return false;
  }
}

// -------------------------
// Conflict checkers
// -------------------------

function conflictWithClosure(
  closure: Closure,
  attemptedStart: number,
  attemptedEnd: number,
  attemptedDate: string
): boolean {
  const closureStartMinutes = utcToLocalMinutes(closure.startTimestamp);
  const closureEndMinutes =
    closureStartMinutes + (closure.durationMinutes || 0);
  const closureDate = new Date(closure.startTimestamp);
  const attemptedDateObj = new Date(attemptedDate);

  const timeOverlap = doIntervalsOverlap(
    attemptedStart,
    attemptedEnd,
    closureStartMinutes,
    closureEndMinutes
  );
  const recurrenceMatch = occursAtRecurrence(
    closureDate,
    attemptedDateObj,
    closure.recurringType as recurrenceEnum
  );

  return timeOverlap && recurrenceMatch;
}

function conflictWithinClosures(
  allClosures: CourtWithClosures[],
  attemptedCourtID: number,
  attemptedStart: number,
  attemptedEnd: number,
  attemptedDate: string
): boolean {
  const courtClosures = allClosures.find(
    (c) => c.courtID === attemptedCourtID
  );
  if (!courtClosures || !courtClosures.closures.length) return false;

  return courtClosures.closures.some((closure) =>
    conflictWithClosure(
      closure,
      attemptedStart,
      attemptedEnd,
      attemptedDate
    )
  );
}

function withinOpenHours(
  daySettings: daySettingsType,
  dayKey: string,
  startMinutes: number,
  endMinutes: number
): boolean {
  const key = dayKey.toLowerCase();
  const settings = daySettings[key];
  if (!settings?.is_day_bookable) return false;

  const open = parseHHMMToMinutes(settings.openTime);
  const close = parseHHMMToMinutes(settings.closeTime);
  return startMinutes >= open && endMinutes <= close;
}

function conflictWithBookings(
  bookings: BookingDetails[],
  attemptedStart: number,
  attemptedEnd: number,
  attemptedCourtID: number,
  attemptedSubUnitIDs: number[]
): boolean {
  for (const booking of bookings) {
    const existingStart = utcToLocalMinutes(booking.startTime);
    const existingEnd = utcToLocalMinutes(booking.endTime);

    const sameCourt = attemptedCourtID === booking.courtID;
    const overlap = doIntervalsOverlap(
      attemptedStart,
      attemptedEnd,
      existingStart,
      existingEnd
    );

    const subunitIDs =
      booking.units[0]?.subUnits?.map((su) => su.id) ?? [];
    const subunitOverlap = attemptedSubUnitIDs.some((id) =>
      subunitIDs.includes(id)
    );

    if (sameCourt && overlap && subunitOverlap) return true;
  }
  return false;
}

// -------------------------
// Master Validator
// -------------------------

export function hasBookingConflict(
  dayKey: string,
  daySettings: daySettingsType,
  attemptedCourtID: number,
  attemptedSubUnits: number[],
  attemptedStartMinutes: number,
  attemptedEndMinutes: number,
  bookings: BookingEntry[],
  attemptedDate: string,
  allCourtsWithClosures: CourtWithClosures[]
): boolean {
  const approved = bookings
    .filter((b) => b.details.courtStatus === courtStatusEnum.APPROVED)
    .map((b) => b.details);

  const archived = bookings
    .filter((b) => b.details.courtStatus === courtStatusEnum.ARCHIVED)
    .map((b) => b.details);

  const currentConflict = conflictWithBookings(
    approved,
    attemptedStartMinutes,
    attemptedEndMinutes,
    attemptedCourtID,
    attemptedSubUnits
  );

  const archivedConflict = conflictWithBookings(
    archived,
    attemptedStartMinutes,
    attemptedEndMinutes,
    attemptedCourtID,
    attemptedSubUnits
  );

  const closureConflict = conflictWithinClosures(
    allCourtsWithClosures,
    attemptedCourtID,
    attemptedStartMinutes,
    attemptedEndMinutes,
    attemptedDate
  );

  const outsideHours = !withinOpenHours(
    daySettings,
    dayKey,
    attemptedStartMinutes,
    attemptedEndMinutes
  );

  return (
    currentConflict || archivedConflict || closureConflict || outsideHours
  );
}
