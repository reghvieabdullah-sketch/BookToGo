import { QUERY_PARAM_VENUE_CLOSURE_ID } from "$lib/constants/postgressFunctionConstants";
import { deleteVenueClosure, getVenueClosures, updateVenueClosures } from "$lib/dbFunctions/venuesDB";
import { json, type RequestHandler } from "@sveltejs/kit";

export const GET: RequestHandler = async ({ locals, params }) => {
    const { venueID } = params;
    const result = await getVenueClosures(locals.supabase, venueID);
    return result.error ? json({ error: result.error }, { status: 400 }) : json(result.data, { status: 200 });

};

export const PUT: RequestHandler = async ({ locals, request, params }) => {
    const { venueID } = params;
    const closuresJSON = await request.json();
    const result = await updateVenueClosures(locals.supabase, venueID, closuresJSON)
    return result.error ? json({ error: result.error }, { status: 400 }) : json(result.data, { status: 200 });

};

export const DELETE: RequestHandler = async ({ locals, url }) => {
    const closureID = url.searchParams.get(QUERY_PARAM_VENUE_CLOSURE_ID)
    const result = await deleteVenueClosure(locals.supabase, closureID);
    return result.error ? json({ error: result.error }, { status: 400 }) : json(result.data, { status: 200 });
};