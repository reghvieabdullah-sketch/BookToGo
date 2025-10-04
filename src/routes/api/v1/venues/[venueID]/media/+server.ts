import { updateVenueImages } from "$lib/dbFunctions/venuesDB";
import { json, type RequestHandler } from "@sveltejs/kit";

export const PUT: RequestHandler = async ({ locals, request, params }) => {
    const { venueID } = params;
    const files = await (await request.formData()).getAll('files').filter((f): f is File => f instanceof File);
    const result = await updateVenueImages(locals.supabase, venueID, files);
    return result.error ? json({ error: result.error }, { status: 400 }) : json(result.data, { status: 200 });
};