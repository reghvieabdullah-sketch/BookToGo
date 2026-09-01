import { consumeVenueInvitation } from '$lib/dbFunctions/venuesDB.js';
import { error, redirect } from '@sveltejs/kit';
import crypto from 'node:crypto';

export const load = async ({ params, url, locals: { supabase, session, venueURL } }) => {
  const { token } = params;
  if (!session) {
    const next = encodeURIComponent(url.pathname);
    throw redirect(303, `/auth/next?=${next}`)
  }
  const tokenHash = crypto.createHash('sha256').update(token).digest('hex');
  const { data, error: invError } = await consumeVenueInvitation(supabase, tokenHash);
  if (invError) {
    console.error(invError)
    throw error(500, "Failed to process invitation");
  }
  if (!data?.length) {
    throw error(404, "Invitation is invalid, expired or already used");
  }

  throw redirect(303, `https://${venueURL}.booktogo.lk/dashboard`);
}