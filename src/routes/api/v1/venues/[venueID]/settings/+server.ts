import { QUERY_PARAM_VENUE_ID } from "$lib/constants/postgressFunctionConstants";
import { getVenueSettings, updateVenueSettings } from "$lib/dbFunctions/venuesDB";
import type { RequestHandler } from "@sveltejs/kit";

export const GET: RequestHandler = async ({ locals, url, params }) => {
    const { venueID } = params;
    return getVenueSettings(locals.supabase, venueID);
};

export const PUT: RequestHandler = async ({ locals, request, params }) => {
    const settingsJSON = await request.json();
    const { venueID } = params;
    return updateVenueSettings(locals.supabase, settingsJSON, venueID)
};