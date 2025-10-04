
import { json, type RequestHandler } from "@sveltejs/kit";
import type { courtsType, VenueData } from "../../../../types/bookingTypes";
import type { SupabaseClient } from "@supabase/supabase-js";
import { type ActionMap, updateImageData, updateVenueData, updateCourtData } from "$lib/helperFunctions";


const dataFunctionMappings: ActionMap = {
    updateVenue: (formData: FormData, supabase: SupabaseClient, venueID: string) => handlePOSTVenueUpdate(formData, supabase, venueID),
    updateImage: (formData: FormData, supabase: SupabaseClient, venueID: string) => handlePOSTUpdateImage(formData, supabase, venueID),
};


export const GET: RequestHandler = async ({ url, locals }) => {
    const supabase = locals.supabase;
    const venueID = url.searchParams.get("venue_id");
    if (!venueID) return json({ error: "Missing venue id" }, { status: 400 });
    const { data, error } = await supabase
        .rpc('get_venue_courts', { venueid: venueID, is_owner: true });
    return error
        ? json({ error: error.message }, { status: 500 })
        : json(data, { status: 200 });
};

async function handlePOSTUpdateImage(formData: FormData, supabase: SupabaseClient, venueID: string) {
    const files = formData.getAll('files').filter((f): f is File => f instanceof File);
    const urls: string[] = await updateImageData(supabase, venueID, files);
    const venueData = JSON.parse(formData.get('venueData') as string) as VenueData;
    venueData.venueCourtCarouselImages = urls;
    return await updateVenueData(venueData, supabase);
}

async function handlePOSTVenueUpdate(formData: FormData, supabase: SupabaseClient, venueID: string) {
    const venueData = JSON.parse(formData.get('venueData') as string) as VenueData;
    const courtData = JSON.parse(formData.get('courtData') as string) as courtsType;
    await updateCourtData(courtData, venueID, supabase);
    return await updateVenueData(venueData, supabase);
}


export const POST: RequestHandler = async ({ request, locals, url }) => {
    const action = url.searchParams.get("action");
    const supabase = locals.supabase as SupabaseClient;
    const userID = locals.session?.user.id;
    const formData = await request.formData();
    const venueId = formData.get('venueID') as string;

    if (!venueId) return json({ error: "Missing venueID" }, { status: 400 });
    if (!action || !(action in dataFunctionMappings)) return json({ error: `Invalid or missing action. Allowed: ${Object.keys(dataFunctionMappings).join(', ')}` }, { status: 400 });
    // if (!userID) return json({ error: "User not identified." }, { status: 400 });
    // if (!(await isOwner(supabase, venueId, userID))) return json({ error: "Not authorized!" }, { status: 403 });

    try {
        return await dataFunctionMappings[action](formData, supabase, venueId);
    } catch (err: unknown) {
        const error = err instanceof Error ? err : new Error("Unknown error");
        return json({ message: error.message }, { status: 500 });
    }
};
