import type { Closure, courtsType, CourtWithClosures, VenueData, VenueSettings } from "../../types/bookingTypes";
import type { SupabaseClient } from "@supabase/supabase-js";
import { FN_CREATE_SAMPLE_VENUE, FN_CREATE_VENUE_INVITE_URL, FN_IS_SUPER_OWNER, FN_IS_VENUE_OWNER, FN_LOGO_URL_UPDATE, FN_OWNER_CONTACT_US, FN_VENUE_BUNDLER_GET, FN_VENUE_CLOSURES_DELETE, FN_VENUE_CLOSURES_GET, FN_VENUE_CLOSURES_UPDATE, FN_VENUE_COURTS_GET, FN_VENUE_COURTS_UPDATE, FN_VENUE_GENERAL_SETTINGS_GET, FN_VENUE_GENERAL_SETTINGS_UPDATE, FN_VENUE_IMAGE_UPDATE, FN_VENUE_INVITATION_CONSUMPTION, FN_VENUE_SETTINGS_GET, FN_VENUE_SETTINGS_UPDATE, VENUE_IMAGE_BUCKET_FORMATS, VENUE_IMAGE_BUCKET_PATH, VENUE_IMAGE_BUCKET_PREFIX, VENUE_LOGO_BUCKET_PATH } from "$lib/constants/postgressFunctionConstants";
import { runRPC, ensureArgs, type DBResult } from "./commonServerTypesAndFuncs";
import crypto from 'node:crypto';

// IMPORTANT: All update functions are protected at the database level with ownership checks. Thus adding ownership checks here is redundant. well kindof but not for booking related logic, which is as to why its in a separate file


export async function contactRegardingPotentialCustomers(supabase: SupabaseClient, contactName: string, contactEmail: string, contactPhone: string): Promise<DBResult<any>>{
    console.log(contactName, contactEmail, contactPhone);
    
    const missing = ensureArgs({contactName, contactEmail, contactPhone});
    if (missing) return {data: null, error: missing };
    return await runRPC(supabase, FN_OWNER_CONTACT_US, {p_contact_name: contactName, p_contact_email: contactEmail, p_contact_phone: contactPhone});
}



export async function isUserSuperOwner(supabase: SupabaseClient): Promise<boolean> {
    try {
        const { data, error } = await runRPC(supabase, FN_IS_SUPER_OWNER, {});  
        return !error && data === true;
    } catch (err) {
        return false;
    }
}

/** Boolean returned indicating is the passed in userID is the ownersID. There is already a function at db level to check verification. But this is added for sake of completeness */
export async function isUserVenueOwner(supabase: SupabaseClient, venueURL: string) {
    try {
        const { data, error } = await runRPC(supabase, FN_IS_VENUE_OWNER, { p_venue_url: venueURL });
        return !error && data === true;
    } catch (err) {
        return false;
    }
}


/** Creates a new venue if the user is a super owner. And returns the invite token */
export async function createNewVenue(supabase: SupabaseClient, venueURL: string, isSuperOwner: boolean): Promise<DBResult<any>> {
    if (!isSuperOwner) return { data: null, error: 'User is not a super owner and cannot create a new venue.' };
    
    const createStatus = await runRPC(supabase, FN_CREATE_SAMPLE_VENUE, { p_venue_url_name: venueURL });
    if (createStatus.error || !createStatus.data) return { data: null, error: createStatus.error ?? 'Failed to create new venue' };

    const token = crypto.randomBytes(32).toString('base64url');
    const tokenHash = crypto.createHash('sha256').update(token).digest('hex');
    const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(); // 24 hours from now
    const newVenueID = createStatus.data;
    const urlStatus = await runRPC(supabase, FN_CREATE_VENUE_INVITE_URL, { p_venue_id: newVenueID, p_token_hash: tokenHash, p_expires_at: expiresAt });
    if (urlStatus.error || !urlStatus.data) return { data: null, error: urlStatus.error ?? 'Failed to create invite URL' };
    const invitationURL = `${venueURL}.booktogo.lk/invite/${token}` 
    return { data: { inviteURL: invitationURL }, error: null };
}

export async function consumeVenueInvitation(supabase: SupabaseClient, token: string): Promise<DBResult<any>> {
    if (!token) return { data: null, error: "Token doesn't exist" };
    const consumptionStatus = await runRPC(supabase, FN_VENUE_INVITATION_CONSUMPTION, { p_token_hash: token });
    return consumptionStatus;
}



/**Returns list of image paths under the venue specific bucket. */
export async function getVenueImages(supabase: SupabaseClient, venueID: string, readLimit?: 1000): Promise<string[]> {
    const { data: files, error: listError } = await supabase.storage
        .from(VENUE_IMAGE_BUCKET_PATH)
        .list(venueID, { limit: readLimit ? readLimit : 1000 });
    if (listError || !files || files.length === 0) return [];
    return files.map(file => `${venueID}/${file.name}`);
}

/**Deletes list of image paths under the venue specific bucket. */
export async function deleteVenueImages(supabase: SupabaseClient, imagePaths: string[]): Promise<number> {
    if (!imagePaths || imagePaths.length === 0) return 0;
    const { error: delError } = await supabase.storage
        .from(VENUE_IMAGE_BUCKET_PATH)
        .remove(imagePaths);
    if (delError) throw Error(`Error deleting files: ${delError.message}`);
    return imagePaths.length;
}

/**Uploads list of image paths under the venue specific bucket. */
export async function uploadVenueImages(supabase: SupabaseClient, venueID: string, files: File[]): Promise<string[]> {
    const urls: string[] = [];
    for (let index = 0; index < files.length; index++) {
        const ext = files[index].name.split('.').pop();
        if (!ext || !(VENUE_IMAGE_BUCKET_FORMATS.includes(ext))) throw Error(`Unsupported image format: ${ext}`);
        const fileName = `${VENUE_IMAGE_BUCKET_PREFIX}-${index + 1}_${Date.now()}.${ext}`;
        const { error } = await supabase.storage
            .from(VENUE_IMAGE_BUCKET_PATH)
            .upload(`${venueID}/${fileName}`, files[index], { upsert: true });
        if (error) throw Error("Error uploading file: " + error.message);
        const publicUrl = supabase.storage
            .from(VENUE_IMAGE_BUCKET_PATH)
            .getPublicUrl(`${venueID}/${fileName}`).data.publicUrl;
        urls.push(publicUrl);
    }
    return urls;
}

export async function uploadLogoURL(supabase: SupabaseClient, venueID: string | null | undefined, logoURL: string | null | undefined): Promise<DBResult<string>> {
    const missing = ensureArgs({ p_venue_id: venueID, p_logo_url: logoURL });
    if (missing) return { data: null, error: missing };
    const { data, error } = await runRPC(supabase, FN_LOGO_URL_UPDATE, { p_venue_id: venueID, p_logo_url: logoURL });
    if (error) return { data: null, error: error };
    return { data: data, error: null };
}

export async function uploadVenueLogoImage(supabase: SupabaseClient, venueID: string | null | undefined, file: File | null | undefined ): Promise<DBResult<string>> {
    const missing = ensureArgs({ p_venue_id: venueID, p_file: file });
    if (missing) return { data: null, error: missing };
    
    const ext = file!.name.split('.').pop()?.toLowerCase();
    if (!ext || !(VENUE_IMAGE_BUCKET_FORMATS.includes(ext))) {
        return { data: null, error: `Unsupported image format: ${ext}` };
    }

    const filePath = `${venueID}/logo.${ext}`;
    const { error: uploadError } = await supabase.storage
        .from(VENUE_LOGO_BUCKET_PATH)
        .upload(filePath, file!, {
            upsert: true,
            contentType: file!.type
    });
    
    if (uploadError) {
        console.error("Error uploading logo:", uploadError);
        return { data: null, error: `Failed to upload venue logo: ${uploadError.message}`};
    }
    const publicUrl = supabase.storage.from(VENUE_LOGO_BUCKET_PATH).getPublicUrl(filePath).data.publicUrl;
    return uploadLogoURL(supabase, venueID, publicUrl); // Update the logo URL in the database
}


export async function updateVenueImages(supabase: SupabaseClient, venueID: string | null | undefined, files: File[]): Promise<DBResult<any>> {
    /* 
        Incase of any failure, we must provide fallbacks. For that
        1. If its not the owner, return a fail response
        2. First take the file paths of all the current images (to delete IF the uploads are successful)
        3. Try uploading the files
        4. If its a success, delete the old files. and then update the venue's image paths in the database.
        5. return a response indicating the success state
    */
    const missing = ensureArgs({ p_venue_id: venueID })
    if (missing) return { data: null, error: missing }

    const oldImagePaths = await getVenueImages(supabase, venueID!);
    const newImagePaths = await uploadVenueImages(supabase, venueID!, files)
    console.log("New image paths after upload: ", newImagePaths);
    console.log("Old image paths before upload: ", oldImagePaths);
    
    const settingsResponse = await runRPC(supabase, FN_VENUE_IMAGE_UPDATE, { p_venue_id: venueID, p_image_urls: newImagePaths });
    if (!settingsResponse.error) await deleteVenueImages(supabase, oldImagePaths); // delete the old images
    return settingsResponse;
}

/**Gets the bundle containing settings, courts, and general data of a venue. Bundles 3 separate calls into 1 api call. 
 * Meant for when a client requests a page initially and needs to get all 3 sequentially*/
export async function getVenueBundled(supabase: SupabaseClient, venueURL: string | null | undefined): Promise<DBResult<any>> {
    const missing = ensureArgs({ p_venue_url: venueURL })
    if (missing) return { data: null, error: missing }
    return runRPC(supabase, FN_VENUE_BUNDLER_GET, { p_venue_url: venueURL });
}

/**Gets the general venue settings of a specific venue by venue URL*/
export async function getVenueGeneralSettings(supabase: SupabaseClient, venueURL: string | null | undefined): Promise<DBResult<VenueData>> {
    const missing = ensureArgs({ p_venue_url: venueURL })
    if (missing) return { data: null, error: missing };
    return runRPC(supabase, FN_VENUE_GENERAL_SETTINGS_GET, { p_venue_url: venueURL });
}

/**Updates a specific venues settings under the venue specific bucket. No type/null checks done.*/
export async function updateVenueGeneralSettings(supabase: SupabaseClient, venueData: VenueData): Promise<DBResult<any>> {
    const missing = ensureArgs( { p_venue: venueData });
    if (missing) return { data: null, error: missing };
    return runRPC(supabase, FN_VENUE_GENERAL_SETTINGS_UPDATE, { p_venue: venueData })
}

/**Gets the courts of a specific venue by venueID*/
export async function getVenueCourts(supabase: SupabaseClient, venueID: string | null | undefined): Promise<DBResult<courtsType>> {
    const missing = ensureArgs({ p_venue_id: venueID })
    if (missing) return { data: null, error: missing };
    return runRPC(supabase, FN_VENUE_COURTS_GET, { p_venue_id: venueID });
}

/**Updates a specific venues courts. No type/null checks done.*/
export async function updateVenueCourts(supabase: SupabaseClient, courtData: courtsType, venueID: string | null | undefined): Promise<DBResult<any>> {
    const missing = ensureArgs({ p_venue_id: venueID, p_courts: courtData })
    if (missing) return { data: null, error: missing };
    return runRPC(supabase, FN_VENUE_COURTS_UPDATE, { p_venue_id: venueID, p_courts: courtData });
}

/**Gets a specific venues settings from venueID. No type/null checks done.*/
export async function getVenueSettings(supabase: SupabaseClient, venueID: string | null | undefined): Promise<DBResult<VenueSettings>> {
    const missing = ensureArgs({ p_venue_id: venueID })
    if (missing) return { data: null, error: missing };
    return runRPC(supabase, FN_VENUE_SETTINGS_GET, { p_venue_id: venueID });
}

/**Updates a specific venues settings from venueID & venueData. No type/null checks done.*/
export async function updateVenueSettings(supabase: SupabaseClient, settingsJSON: VenueSettings, venueID: string | null | undefined): Promise<DBResult<any>> {
    const missing = ensureArgs({ p_venue_id: venueID, p_venue_settings_json: settingsJSON })
    if (missing) return { data: null, error: missing };
    return runRPC(supabase, FN_VENUE_SETTINGS_UPDATE, { p_venue_id: venueID, p_venue_settings_json: settingsJSON });
}

/**Gets a specific venues closures from venueID. No type/null checks done.*/
export async function getVenueClosures(supabase: SupabaseClient, venueID: string | null | undefined): Promise<DBResult<Closure[]>> {
    const missing = ensureArgs({ p_venue_id: venueID })
    if (missing) return { data: null, error: missing };
    return runRPC(supabase, FN_VENUE_CLOSURES_GET, { p_venue_id: venueID });
}

/**Updates a specific venues closures from venueID & courtClosure. No type/null checks done.*/
export async function updateVenueClosures(supabase: SupabaseClient, venueID: string | null | undefined, courtClosure: CourtWithClosures[]): Promise<DBResult<any>> {
    const missing = ensureArgs({ p_venue_id: venueID, p_all_courts_json: courtClosure })
    if (missing) return { data: null, error: missing };
    return runRPC(supabase, FN_VENUE_CLOSURES_UPDATE, { p_all_courts_json: courtClosure });
}

/**Deletes a specific venues closure from closureID. No type/null checks done.*/
export async function deleteVenueClosure(supabase: SupabaseClient, closureID: string | null | undefined): Promise<DBResult<any>> {
    const missing = ensureArgs({ p_closure_id: closureID })
    if (missing) return { data: null, error: missing };
    return runRPC(supabase, FN_VENUE_CLOSURES_DELETE, { p_closure_id: closureID });
}