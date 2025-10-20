import type { PageLoad } from "./$types";
import type { BookingDetails } from "../../types/bookingTypes";

export const load: PageLoad = async ({ parent, fetch }) => {
    const parentData = await parent();

    try {
        const response = await fetch(`/api/v1/my-bookings/${parentData.venueID}`);

        if (!response.ok) {
            console.error('Failed to fetch bookings:', response.status);
            return {
                bookings: [] as BookingDetails[]
            };
        }

        const bookings: BookingDetails[] = await response.json();
        return {
            bookings
        };
    } catch (error) {
        console.error('Error loading bookings:', error);
        return {
            bookings: [] as BookingDetails[]
        };
    }
};