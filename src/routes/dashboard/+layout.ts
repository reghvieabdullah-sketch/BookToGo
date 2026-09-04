import { QUERY_PARAM_VENUE_ID, QUERY_PARAM_BOOKING_DATE, QUERY_PARAM_VENUE_BOOKING_DATE_START, QUERY_PARAM_VENUE_BOOKING_DATE_END, QUERY_PARAM_BOOKING_CLOSURE_BUNDLE_DASHBOARD_TYPE } from "$lib/constants/postgressFunctionConstants";
import type { LayoutLoad } from './$types'

export const load: LayoutLoad = async ({ fetch, parent, depends, url }) => {
  const parentData = await parent();
  const session = parentData.session; // <- required

  let venueID = url.searchParams.get(QUERY_PARAM_VENUE_ID) || parentData.venueData.venueID;
  if (!venueID) throw new Error("No venueID found in URL or parent layout");
  depends('layout:dashboard')
  const dateParam = url.searchParams.get(QUERY_PARAM_BOOKING_DATE);
  const targetDate = dateParam ? new Date(dateParam) : new Date();
  
  const startDate = new Date();
  const allowedBookingDaysIntoFuture = parentData.settingsData.maxBookingNoticeMinutes; // convert minutes to days
  const endDate = new Date(startDate.getTime() + allowedBookingDaysIntoFuture * 60 * 1000); // add allowed days into future to start date
  // const endDate = new Date(targetDate.getFullYear(), targetDate.getMonth() + 2, 0);

  const response = await fetch(
    `/api/v1/bundler/${venueID}?${QUERY_PARAM_VENUE_BOOKING_DATE_START}=${startDate.toISOString()}&${QUERY_PARAM_VENUE_BOOKING_DATE_END}=${endDate.toISOString()}&${QUERY_PARAM_BOOKING_CLOSURE_BUNDLE_DASHBOARD_TYPE}=true`
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
