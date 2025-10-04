// routes/api/venue/+server.ts
import { json, type RequestHandler } from "@sveltejs/kit";
import type { VenueSettings } from "../../../../types/bookingTypes";
export const GET: RequestHandler = async ({ url, locals }) => {
    const supabase = locals.supabase;
    const venueID = url.searchParams.get("venue_id");
    if (!venueID || !parseInt(venueID)) return json({ error: "Missing venue id" }, { status: 400 });
    const { data, error } = await supabase
        .rpc('get_venue_settings', { p_venue_id: venueID });
    return error
        ? json({ error: error.message }, { status: 500 })
        : json(data, { status: 200 });
};


export const POST: RequestHandler = async ({ locals, request }) => {
    const supabase = locals.supabase;
    const formData = await request.formData();
    const venueID = formData.get('venueID') as string;
    const userID = locals.session?.user.id;
    const settingsJSON = JSON.parse(formData.get('venueSettingsFormData') as string) as VenueSettings;
    if (!venueID || !parseInt(venueID)) return json({ error: "Missing venue id" }, { status: 400 });
    if (!settingsJSON) return json({ error: "Missing venue Settings" }, { status: 400 });
    // if (!userID) return json({ error: "User not identified." }, { status: 400 });
    // if (!(await isOwner(supabase, venueID, userID))) return json({ error: "Not authorized!" }, { status: 403 });
    const { data, error } = await supabase
        .rpc('update_venue_settings', { p_venue_id: venueID, p_venue_settings_json: settingsJSON });
    return error
        ? json({ error: error.message }, { status: 500 })
        : json(data, { status: 200 });
};
