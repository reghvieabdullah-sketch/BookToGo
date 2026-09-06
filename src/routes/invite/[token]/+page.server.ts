import { consumeVenueInvitation } from '$lib/dbFunctions/venuesDB.js';
import { error, redirect } from '@sveltejs/kit';
import crypto from 'node:crypto';

export const load = async ({ params, url, locals: { supabase, session, venueURL, isUserSuperOwner } }) => {
  const { token } = params;
  if (!session) {
    const next = encodeURIComponent(url.pathname);
    throw redirect(303, `/auth?next=${next}`)
  }

  if (isUserSuperOwner) {
    throw error(404, "As a super admin, you are granted access to all venues. Thus this invitation is only valid (and still valid) for non admins");
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