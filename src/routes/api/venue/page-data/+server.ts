// routes/api/venue/+server.ts
import { json, type RequestHandler } from "@sveltejs/kit";

export const GET: RequestHandler = async ({ url, locals }) => {
    const supabase = locals.supabase;
    const venue_id = url.searchParams.get("p_venue_url");
    if (!venue_id) return json({ error: "Missing venue url" }, { status: 400 });
    const { data, error } = await supabase
        .rpc('get_pg_assets', { p_venue_url: venue_id });
    return error
        ? json({ error: error.message }, { status: 500 })
        : json(data, { status: 200 });
};
