// Utility functions for time and date formatting

import { dayNamesFull } from "$lib/constants/dayMonthconstants";
import { recurrenceEnum } from "$lib/constants/postgressFunctionConstants";

export function isWeekend(day: Date): boolean {
    const dayOfWeek = day.getDay(); // 0 = Sunday, 6 = Saturday
    return dayOfWeek === 0 || dayOfWeek === 6;
}

export function HHMMToMinutes(time: string): number {
    const [hours, minutes] = time.split(':').map(Number);
    return hours * 60 + minutes;
}

export function minutesToHHMM(totalMinutes: number): string {
    const hours = Math.floor(totalMinutes / 60);
    const minutes = totalMinutes % 60;
    return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}`;
}

export function to12HourFormat(time24: string): string {
    // let [hour, minute] = time24.split(':').map(Number);
    // const ampm = hour >= 12 ? 'PM' : 'AM';
    // hour = hour % 12 || 12;
    // return `${hour}:${minute.toString().padStart(2, '0')} ${ampm}`;
    return time24;
}

export function formatDate(dateStr: string): string {
    const date = new Date(dateStr);
    return date.toLocaleDateString("en-US", {
        weekday: "long", // e.g. Tuesday
        month: "short",  // e.g. Oct
        day: "numeric",  // e.g. 1
    });
}


export function to24HourFormat(time12: string): string {
    let [time, modifier] = time12.split(' ');
    let [hour, minute] = time.split(':').map(Number);
    if (modifier.toUpperCase() === 'AM' && hour === 12) {
        hour = 0;
    } else if (modifier.toUpperCase() === 'PM' && hour !== 12) {
        hour += 12;
    }
    return `${hour.toString().padStart(2, '0')}:${minute.toString().padStart(2, '0')}`;
}


/**
 * Converts a UTC timestamp to minutes of UTC day.
 * (e.g. 08:30 UTC => 510)
 */
export function utcToMinutes(utcString: string): number {
  const dt = new Date(utcString);
  return dt.getUTCHours() * 60 + dt.getUTCMinutes();
}

/**
 * Converts a time string like "09:00:00+05:30" or "18:00:00Z" to total UTC minutes.
 */
export function parseTimeStringToUTCMinutes(timeString: string): number {
  // Construct a valid ISO datetime (date part doesn't matter)
  const iso = `1970-01-01T${timeString}`;
  const date = new Date(iso);

  if (isNaN(date.getTime())) {
    throw new Error(`Invalid time string: ${timeString}`);
  }

  return date.getUTCHours() * 60 + date.getUTCMinutes();
}


export function localTimeToUTC(date: Date, timeStr: string): string {
		const [hours, minutes] = timeStr.split(':').map(Number);
		const localDate = new Date(date);
		localDate.setHours(hours, minutes, 0, 0);
		return localDate.toISOString();
}


export function doIntervalsOverlap(startA: number, endA: number, startB: number, endB: number): boolean {
  return startA < endB && endA > startB;
}

export function occursAtRecurrence(closureDateString: string, attemptedDateString: string, recurrenceType: recurrenceEnum | string): boolean {
  const closureDate = new Date(closureDateString)
  const attemptedDate = new Date(attemptedDateString)
  const type = typeof recurrenceType === "string" ? recurrenceType : recurrenceType.valueOf();
  switch (type) {
    case recurrenceEnum.DAILY:
      return true;
    case recurrenceEnum.WEEKLY:
      return closureDate.getUTCDay() === attemptedDate.getUTCDay();
    case recurrenceEnum.MONTHLY:
      return closureDate.getUTCDate() === attemptedDate.getUTCDate();
    case recurrenceEnum.YEARLY:
      return (
        closureDate.getUTCDate() === attemptedDate.getUTCDate() &&
        closureDate.getUTCMonth() === attemptedDate.getUTCMonth()
      );
    case recurrenceEnum.ONCE:
      return closureDate.toISOString().split('T')[0] === attemptedDate.toISOString().split('T')[0];
    default:
      return false;
  }
}


export function timeStampToDayKey(timestampString: string){
    const isoDayIndex = ((new Date( timestampString).getUTCDay() + 6) % 7); // 0=Mon … 6=Sun
    return dayNamesFull[isoDayIndex];
}

export function timeStampToDateString(timestampString: string){
    return new Date(timestampString).toDateString();
}


export function laterTimestamp(t1: string, t2: string){
  return new Date(t1) > new Date(t2) ? t1 : t2;
}

export function isSameDay(t1: string, t2: string){
  return new Date(t1).toDateString() !== new Date(t2).toDateString()
}