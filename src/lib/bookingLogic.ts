// Booking logic functions that can be used on server or client
import type { BookingDetails, BookingEntry, Closure, CourtWithClosures, daySettingsType } from '../types/bookingTypes';
import { recurrenceEnum, courtStatusEnum } from './constants/postgressFunctionConstants';

function getRecurrence(date1: Date, date2: Date): recurrenceEnum {
    const diffMs = date2.getTime() - date1.getTime();
    const diffDays = Math.abs(diffMs / (1000 * 60 * 60 * 24));

    if (Math.abs(diffDays - 1) < 0.1) return recurrenceEnum.DAILY;
    if (Math.abs(diffDays - 7) < 1) return recurrenceEnum.WEEKLY;
    if (date1.getDate() === date2.getDate()) return recurrenceEnum.MONTHLY;
    if (date1.getDate() === date2.getDate() && date1.getMonth() === date2.getMonth()) return recurrenceEnum.YEARLY;
    return recurrenceEnum.NOT_REGULAR;
}



function getHHMMSSInMinutes(timeString: string, delimiter: string = ':') {
    let [h, m, s] = timeString.split(delimiter).map(Number);
    return h * 60 + m;
}

function utcToLocalMinutes(utcStr: string) {
    let dt = new Date(utcStr); // interprets UTC string
    let hours = dt.getHours();
    let minutes = dt.getMinutes();
    return hours * 60 + minutes;
}

function occursAtRecurrence(closureDate: Date, attemptedDate: Date, recurringType: string | recurrenceEnum) {
    // Normalize recurringType to string for comparison
    const recurringTypeStr = typeof recurringType === 'string' ? recurringType : recurringType.valueOf();

    // Daily closures apply to every day
    if (recurringTypeStr === recurrenceEnum.DAILY) return true;

    // Once type only matches exact date
    if (recurringTypeStr === recurrenceEnum.ONCE) {
        return closureDate.toLocaleDateString() === attemptedDate.toLocaleDateString();
    }

    // For other types, check if the recurrence pattern matches
    return getRecurrence(closureDate, attemptedDate) === recurringTypeStr;
}

function _isConflictWithSingleClosure(closure: Closure, attemptedStartMinutes: number, attemptedEndMinutes: number, attemptedDate: string) {
    // Use utcToLocalMinutes to properly convert UTC timestamp to local minutes
    const closureStartMinutes = utcToLocalMinutes(closure.startTimestamp);
    const closureEndMinutes = closureStartMinutes + (closure.durationMinutes || 0);
    const closureDate = new Date(closure.startTimestamp.split('T')[0]); // date part
    const attemptedDateObj = new Date(attemptedDate);

    // Check for time overlap: conflicts if they overlap at all
    const timeConflicts = (attemptedStartMinutes < closureEndMinutes && attemptedEndMinutes > closureStartMinutes);
    const dateConflicts = occursAtRecurrence(closureDate, attemptedDateObj, closure.recurringType as recurrenceEnum);

    return (timeConflicts && dateConflicts);
}

function isWithinClosures(allClosures: CourtWithClosures[], attemptedStartMinutes: number, attemptedEndMinutes: number, attemptedCourtID: number, attemptedDate: string) {
    //  find the closures for this court
    const closures = allClosures.filter(c => c.courtID === attemptedCourtID);
    if (!closures || !closures.length) return false; // no closures for this court, so no conflict
    for (const courtClosure of closures) {
        for (const closure of courtClosure.closures) {
            if (_isConflictWithSingleClosure(closure, attemptedStartMinutes, attemptedEndMinutes, attemptedDate)) {
                console.log("Conflict with closure found: ", closure);
                return true;
            }
        }
    }
    return false;
}

function isWithinOpenHours(daySettings: daySettingsType, dayKey: string, startMinutes: number, endMinutes: number) {
    // COMPARE WITH LOCAL TIME
    dayKey = dayKey.toLowerCase(); // cause im sure my ass would try sending in uppercase. since im like that
    if (!daySettings[dayKey].is_day_bookable) return false;
    const openTimeString = daySettings[dayKey].openTime // already in HH:MM:SS format
    const closeTimeString = daySettings[dayKey].closeTime // already in HH:MM:SS format
    if (!openTimeString || !closeTimeString) return false;

    const openTimeMinutes = getHHMMSSInMinutes(openTimeString)
    const closeTimeMinutes = getHHMMSSInMinutes(closeTimeString)

    return (startMinutes >= openTimeMinutes && endMinutes <= closeTimeMinutes)
}

function _isConflictingWithCurrentBookings(currentBookings: BookingDetails[], attemptedStartMinutes: number, attemptedEndMinutes: number, attemptedCourtID: number, attemptedSubUnitsID: number[]) {
    for (const booking of currentBookings) {
        // bookings are using UTC time format, but the attempted time args here are using local time.
        const oldBookingStartTime = utcToLocalMinutes(booking.startTime);
        const oldBookingEndTime = utcToLocalMinutes(booking.endTime);
        const subunits = booking.units[0].subUnits ? booking.units[0].subUnits.map(su => su.id) : [];
        // Should be (checking if there IS overlap)
        const timeConflicts = (attemptedStartMinutes < oldBookingEndTime && attemptedEndMinutes > oldBookingStartTime);
        const subUnitConflicts = attemptedSubUnitsID.some(item => subunits.includes(item))

        const courtConflicts = attemptedCourtID === booking.courtID;

        if (courtConflicts && timeConflicts) { return true };
    }
    return false;
}

function _isConflictingWithArchivedBookings(archivedBookings: BookingDetails[], attemptedStartMinutes: number, attemptedEndMinutes: number) {
    for (const booking of archivedBookings) {
        // bookings are using UTC time format, but the attempted time args here are using local time.
        const oldBookingStartTime = utcToLocalMinutes(booking.startTime);
        const oldBookingEndTime = utcToLocalMinutes(booking.endTime);
        if (attemptedStartMinutes < oldBookingEndTime && attemptedEndMinutes > oldBookingStartTime) return true;
    }

    return false;
}

export function isConflictingWithBookings(dayKey: string, daySettings: daySettingsType, attemptedCourtID: number, attemptedSubUnitsID: number[], attemptedStartMinutes: number, attemptedEndMinutes: number, bookings: BookingEntry[], attemptedDate: string, allCourtsWithClosures: CourtWithClosures[]) {
    const approvedCourtBookings = bookings.filter(entry => entry.details.courtStatus === courtStatusEnum.APPROVED).map(entry => entry.details);
    const archivedArchivedBookings = bookings.filter(entry => entry.details.courtStatus === courtStatusEnum.ARCHIVED).map(entry => entry.details);
    const conflictWithArchived = _isConflictingWithArchivedBookings(archivedArchivedBookings, attemptedStartMinutes, attemptedEndMinutes)
    const conflictWithCurrent = _isConflictingWithCurrentBookings(approvedCourtBookings, attemptedStartMinutes, attemptedEndMinutes, attemptedCourtID, attemptedSubUnitsID)
    const conflictWithOpenCloseTime = !isWithinOpenHours(daySettings, dayKey, attemptedStartMinutes, attemptedEndMinutes)
    const conflictWithClosures = isWithinClosures(allCourtsWithClosures, attemptedStartMinutes, attemptedEndMinutes, attemptedCourtID, attemptedDate)
    return conflictWithCurrent || conflictWithArchived || conflictWithClosures || conflictWithOpenCloseTime;
}