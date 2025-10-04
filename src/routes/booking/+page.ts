import {
  QUERY_PARAM_BOOKING_DATE,
  QUERY_PARAM_VENUE_BOOKING_DATE_END,
  QUERY_PARAM_VENUE_BOOKING_DATE_START,
  QUERY_PARAM_VENUE_ID
} from "$lib/constants/postgressFunctionConstants";
import type { BookingsForDateRange, CourtWithClosures } from "../../types/bookingTypes";
import type { PageLoad } from "./$types";

export const load: PageLoad = async ({ fetch, parent, url }) => {
  let venueID = url.searchParams.get(QUERY_PARAM_VENUE_ID);
  const parentData = await parent();

  if (!venueID || venueID === '') {
    // fallback to wait for parent layout.
    if (!parentData.venueID) throw new Error("No venueID found in URL or parent layout");
    venueID = parentData.venueID;
  };

  const startDate = url.searchParams.get(QUERY_PARAM_BOOKING_DATE)
    ? new Date(url.searchParams.get(QUERY_PARAM_BOOKING_DATE)!)
    : new Date();

  const endDate = new Date(startDate);
  endDate.setMonth(startDate.getMonth() + 1);

  const response = await fetch(
    `/api/v1/bundler/${venueID}?${QUERY_PARAM_VENUE_BOOKING_DATE_START}=${startDate.toISOString()}&${QUERY_PARAM_VENUE_BOOKING_DATE_END}=${endDate.toISOString()}`
  );


  const { bookingData, closureData } = await response.json();

  return {
    bookingData: bookingData as BookingsForDateRange,
    closureData: closureData as CourtWithClosures[],
    // isLoggedIn: session?.user ? true : false
  };
};
