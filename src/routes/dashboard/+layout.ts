import { QUERY_PARAM_VENUE_ID, QUERY_PARAM_BOOKING_DATE, QUERY_PARAM_VENUE_BOOKING_DATE_START, QUERY_PARAM_VENUE_BOOKING_DATE_END } from "$lib/constants/postgressFunctionConstants";
import type { LayoutLoad } from './$types'

export const load: LayoutLoad = async ({ fetch, parent, depends, url }) => {
  const parentData = await parent();
  const session = parentData.session; // <- required

  let venueID = url.searchParams.get(QUERY_PARAM_VENUE_ID) || parentData.venueID;
  if (!venueID) throw new Error("No venueID found in URL or parent layout");
  depends('layout:dashboard')
  const dateParam = url.searchParams.get(QUERY_PARAM_BOOKING_DATE);
  const targetDate = dateParam ? new Date(dateParam) : new Date();

  const startDate = new Date(targetDate.getFullYear(), targetDate.getMonth(), 1);
  const endDate = new Date(targetDate.getFullYear(), targetDate.getMonth() + 1, 0);

  const response = await fetch(
    `/api/v1/bundler/${venueID}?${QUERY_PARAM_VENUE_BOOKING_DATE_START}=${startDate.toISOString()}&${QUERY_PARAM_VENUE_BOOKING_DATE_END}=${endDate.toISOString()}`
  );


  const { bookingData, closureData } = await response.json();

  return {
    session,
    bookingData,
    closureData,
    venueID,
    targetDate
  };
};
