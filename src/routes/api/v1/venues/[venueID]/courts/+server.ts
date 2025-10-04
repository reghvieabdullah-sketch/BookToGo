import { QUERY_PARAM_VENUE_ID } from "$lib/constants/postgressFunctionConstants";
import { getVenueCourts, updateVenueCourts } from "$lib/dbFunctions/venuesDB";
import type { RequestHandler } from "@sveltejs/kit";

export const GET: RequestHandler = async ({ locals, params }) => {
    const { venueID } = params;
    return getVenueCourts(locals.supabase, venueID);
};

export const PUT: RequestHandler = async ({ locals, request, params }) => {
    const courtsJSON = await request.json();
    const { venueID } = params;
    return updateVenueCourts(locals.supabase, courtsJSON, venueID)
};