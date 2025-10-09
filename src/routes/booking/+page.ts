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
  const t0 = performance.now();

  const parentStart = performance.now();
  const parentData = await parent();
  const parentEnd = performance.now();

  let venueID = url.searchParams.get(QUERY_PARAM_VENUE_ID);
  if (!venueID || venueID === '') {
    if (!parentData.venueID) throw new Error("No venueID found in URL or parent layout");
    venueID = parentData.venueID;
  }

  const dateCalcStart = performance.now();
  const dateParam = url.searchParams.get(QUERY_PARAM_BOOKING_DATE);
  const targetDate = dateParam ? new Date(dateParam) : new Date();
  const startDate = new Date(targetDate.getFullYear(), targetDate.getMonth(), 1);
  const endDate = new Date(targetDate.getFullYear(), targetDate.getMonth() + 1, 0);
  const dateCalcEnd = performance.now();

  const fetchStart = performance.now();
  const response = await fetch(
    `/api/v1/bundler/${venueID}?${QUERY_PARAM_VENUE_BOOKING_DATE_START}=${startDate.toISOString()}&${QUERY_PARAM_VENUE_BOOKING_DATE_END}=${endDate.toISOString()}`
  );
  const fetchEnd = performance.now();

  const jsonParseStart = performance.now();
  const { bookingData, closureData } = await response.json();
  const jsonParseEnd = performance.now();

  const storeStart = performance.now();
  if (isBrowser()) bookingDayData.set({ date: targetDate, entries: [] });
  const storeEnd = performance.now();

  const totalEnd = performance.now();

  console.log(`[load timings]
  parent(): ${(parentEnd - parentStart).toFixed(2)} ms
  date calc: ${(dateCalcEnd - dateCalcStart).toFixed(2)} ms
  fetch(): ${(fetchEnd - fetchStart).toFixed(2)} ms
  response.json(): ${(jsonParseEnd - jsonParseStart).toFixed(2)} ms
  bookingDayData.set(): ${(storeEnd - storeStart).toFixed(2)} ms
  TOTAL: ${(totalEnd - t0).toFixed(2)} ms
  `);

  return {
    bookingData: bookingData as BookingsForDateRange,
    closureData: closureData as CourtWithClosures[],
  };
};
