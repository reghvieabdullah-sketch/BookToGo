import { QUERY_PARAM_VENUE_ID } from "$lib/constants/postgressFunctionConstants";
import { updateVenueImages } from "$lib/dbFunctions/venuesDB";
import type { RequestHandler } from "@sveltejs/kit";

export const PUT: RequestHandler = async ({ locals, request, params }) => {
    const { venueID } = params;
    const files = await (await request.formData()).getAll('files').filter((f): f is File => f instanceof File);
    return updateVenueImages(locals.supabase, venueID, files)
};