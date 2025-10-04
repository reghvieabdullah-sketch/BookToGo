import { QUERY_PARAM_VENUE_CLOSURE_ID } from "$lib/constants/postgressFunctionConstants";
import { deleteVenueClosure, getVenueClosures, updateVenueClosures } from "$lib/dbFunctions/venuesDB";
import type { RequestHandler } from "@sveltejs/kit";

export const GET: RequestHandler = async ({ locals, params }) => {
    const { venueID } = params;
    return getVenueClosures(locals.supabase, venueID);
};

export const PUT: RequestHandler = async ({ locals, request, params }) => {
    const { venueID } = params;
    const closuresJSON = await request.json();
    return updateVenueClosures(locals.supabase, venueID, closuresJSON)
};

export const DELETE: RequestHandler = async ({ locals, url }) => {
    const closureID = url.searchParams.get(QUERY_PARAM_VENUE_CLOSURE_ID)
    console.log("on delete closure id:", closureID);
    
    return deleteVenueClosure(locals.supabase, closureID);
};