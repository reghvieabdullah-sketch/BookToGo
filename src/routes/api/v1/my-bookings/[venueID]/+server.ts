import { getUserBookings } from "$lib/dbFunctions/bookingsDB";
import { json, type RequestHandler } from "@sveltejs/kit";

export const GET: RequestHandler = async ({ locals, params }) => {
    // it is kinda trivial to also add caching here. since this is very user specific
    const { venueID } = params;
    const result = await getUserBookings(locals.supabase, venueID)
    if (result.error) {
        return json({ error: result.error }, { status: 400 });
    };
    return json(result.data, { status: 200 });
};