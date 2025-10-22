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
import { getStartEndDayOfTimeStamp } from "$lib/utils/timeUtils";

export const load: PageLoad = async ({ fetch, parent, url }) => {
  const parentData = await parent();
  let venueID = url.searchParams.get(QUERY_PARAM_VENUE_ID);
  if (!venueID || venueID === '') {
    if (!parentData.venueID) throw new Error("No venueID found in URL or parent layout");
    venueID = parentData.venueID;
  }
  const dateParam = url.searchParams.get(QUERY_PARAM_BOOKING_DATE);
  const targetDate = dateParam ? new Date(dateParam) : new Date();
  const { startDate, endDate } = getStartEndDayOfTimeStamp(targetDate);
  const response = await fetch(
    `/api/v1/bundler/${venueID}?${QUERY_PARAM_VENUE_BOOKING_DATE_START}=${startDate.toISOString()}&${QUERY_PARAM_VENUE_BOOKING_DATE_END}=${endDate.toISOString()}`
  );
  const { bookingData, closureData } = await response.json();
  if (isBrowser()) bookingDayData.set({ date: targetDate, entries: [] });
  console.log(bookingData, closureData);
  
  return {
    bookingData: bookingData as BookingsForDateRange,
    closureData: closureData as CourtWithClosures[],
  };
};
