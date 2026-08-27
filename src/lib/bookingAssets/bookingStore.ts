import { writable } from "svelte/store";
import { type courtsType, type BookingsByDate, type VenueSettings, type VenueData, type CourtWithClosures } from "../../types/bookingTypes";

export const bookingPopupVisible = writable<boolean>(false);
export const bookingDayData = writable<BookingsByDate>({ date: new Date(), entries: [] });
export const isLoading = writable<boolean>(true);
export const fadeDuration = 200;
export const scaleDuration = 250;


export const venueSettingsStore = writable<VenueSettings>();
export const userLoggedInStore = writable<boolean>(false);
export const venueAllCourtClosures = writable<CourtWithClosures[]>([]);
export const venueDataStore = writable<VenueData>();
export const courtDataStore = writable<courtsType>();
