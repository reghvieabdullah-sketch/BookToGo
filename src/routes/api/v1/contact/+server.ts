import { json, type RequestHandler } from "@sveltejs/kit";
import { contactRegardingPotentialCustomers } from "$lib/dbFunctions/venuesDB";


export const POST: RequestHandler = async ({ locals, request }) => {
    const body = await request.json().catch(() => null);
    if (!body) return json({ error: "Invalid JSON" }, { status: 400 });
    
    const { name: contactName, phone:contactEmail, email: contactPhone } = body;
    const result = await contactRegardingPotentialCustomers(locals.supabase, contactName, contactEmail, contactPhone);
    if (result.error) return json({ error: result.error }, { status: 400 });
    return json(result.data, { status: 200 });
};
