import type { PageLoad } from "./$types";

export const load: PageLoad = async ({ parent, fetch }) => {
    const parentData = await parent();

    const bookings = await fetch(`/api/v1/my-bookings/${parentData.venueID}`)
        .then(res => res.json());
    
    console.log('Loaded bookings:', bookings);

    return {
        bookings: bookings || []
    };
};