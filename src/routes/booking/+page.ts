import {
  QUERY_PARAM_BOOKING_DATE,
  QUERY_PARAM_VENUE_BOOKING_DATE_END,
  QUERY_PARAM_VENUE_BOOKING_DATE_START,
  QUERY_PARAM_VENUE_ID
} from "$lib/constants/postgressFunctionConstants";
import { isBrowser } from "@supabase/ssr";
import type { BookingsForDateRange, CourtWithClosures } from "../../types/bookingTypes";
import type { PageLoad } from "./$types";
import { bookingDayData } from "$lib/bookingAssets/bookingStore";

export const load: PageLoad = async ({ fetch, parent, url }) => {
  let venueID = url.searchParams.get(QUERY_PARAM_VENUE_ID);
  const parentData = await parent();

  if (!venueID || venueID === '') {
    // fallback to wait for parent layout.
    if (!parentData.venueID) throw new Error("No venueID found in URL or parent layout");
    venueID = parentData.venueID;
  }

  // Use date from query param or default to today
  const dateParam = url.searchParams.get(QUERY_PARAM_BOOKING_DATE);
  const targetDate = dateParam ? new Date(dateParam) : new Date();

  // Use the month of targetDate
  // TODO - make it so that, if its on an unbookable date, it goes to the next bookable date instead of just the month. this really only happens, for when the the that day is today and today is unbookable.
  // or better yet, handle the date, within the calender component itself.
  const startDate = new Date(targetDate.getFullYear(), targetDate.getMonth(), 1);  // first day of that month
  const endDate = new Date(targetDate.getFullYear(), targetDate.getMonth() + 1, 0); // last day of that month

  const response = await fetch(
    `/api/v1/bundler/${venueID}?${QUERY_PARAM_VENUE_BOOKING_DATE_START}=${startDate.toISOString()}&${QUERY_PARAM_VENUE_BOOKING_DATE_END}=${endDate.toISOString()}`
  );

  // if on the client side, set the date to the targetDate
  if (isBrowser()) bookingDayData.set({ date: targetDate, entries: [] });

  const { bookingData, closureData } = await response.json();

  return {
    bookingData: bookingData as BookingsForDateRange,
    closureData: closureData as CourtWithClosures[],
  };
};
