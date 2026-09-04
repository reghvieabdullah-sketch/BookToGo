import {
  QUERY_PARAM_BOOKING_DATE,
  QUERY_PARAM_BOOKING_SHOW_CONFIRMATION,
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
    if (!parentData.venueData.venueID) throw new Error("No venueID found in URL or parent layout");
    venueID = parentData.venueData.venueID;
  }
  const dateParam = url.searchParams.get(QUERY_PARAM_BOOKING_DATE);
  const keepPopupOpen = url.searchParams.get(QUERY_PARAM_BOOKING_SHOW_CONFIRMATION) === 'true';
  const targetDate = dateParam ? new Date(dateParam) : new Date();
  const { startDate, endDate } = getStartEndDayOfTimeStamp  (targetDate);
  
  const queryPath = `/api/v1/bundler/${venueID}?${QUERY_PARAM_VENUE_BOOKING_DATE_START}=${startDate.toISOString()}&${QUERY_PARAM_VENUE_BOOKING_DATE_END}=${endDate.toISOString()}`;
  
  const response = await fetch( queryPath );
  const { bookingData, closureData } = await response.json();
  const bookingState = {
		showConfirmation: url.searchParams.get('p_show_confirmation') === 'true',
		selectedCourtId: Number(url.searchParams.get('court')) || null,
		selectedUnitId: Number(url.searchParams.get('unit')) || null,
		selectedSubUnitIds: (url.searchParams.get('subunits') ?? '')
			.split(',')
			.filter(Boolean)
			.map(Number),
		selectedDuration: url.searchParams.get('duration') ?? '01:00',
		selectedTime: url.searchParams.get('time') ?? '09:00'
	}
  console.log(bookingState);
  
  if (isBrowser()) bookingDayData.set({ date: targetDate, entries: bookingData[targetDate.toISOString().split('T')[0]] });
  

  return {
    keepPopupOpen, 
    bookingData: bookingData as BookingsForDateRange,
    closureData: closureData as CourtWithClosures[],
    bookingState
  };
};
