// routes/api/venue/+server.ts
import { json, type RequestHandler } from "@sveltejs/kit";

export const GET: RequestHandler = async ({ url, locals }) => {
    const supabase = locals.supabase;
    const venue = url.searchParams.get("venue");
    if (!venue) return json({ error: "Missing venue" }, { status: 400 });

    const { data, error } = await supabase
        .from('venue_mapping')
        .select('venue_id')
        .eq('venue_url_name', venue);

    return error
        ? json({ error: error.message }, { status: 500 })
        : json(data, { status: 200 });
};
