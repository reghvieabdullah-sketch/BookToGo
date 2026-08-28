import type { Closure, courtsType, CourtWithClosures, VenueData, VenueSettings } from "../../types/bookingTypes";
import type { SupabaseClient } from "@supabase/supabase-js";
import { FN_IS_VENUE_OWNER, FN_VENUE_BUNDLER_GET, FN_VENUE_CLOSURES_DELETE, FN_VENUE_CLOSURES_GET, FN_VENUE_CLOSURES_UPDATE, FN_VENUE_COURTS_GET, FN_VENUE_COURTS_UPDATE, FN_VENUE_GENERAL_SETTINGS_GET, FN_VENUE_GENERAL_SETTINGS_UPDATE, FN_VENUE_SETTINGS_GET, FN_VENUE_SETTINGS_UPDATE, VENUE_IMAGE_BUCKET_FORMATS, VENUE_IMAGE_BUCKET_PATH, VENUE_IMAGE_BUCKET_PREFIX } from "$lib/constants/postgressFunctionConstants";
import { runRPC, ensureArgs, type DBResult } from "./commonServerTypesAndFuncs";

// IMPORTANT: All update functions are protected at the database level with ownership checks. Thus adding ownership checks here is redundant. well kindof but not for booking related logic, which is as to why its in a separate file


/** Boolean returned indicating is the passed in userID is the ownersID. There is already a function at db level to check verification. But this is added for sake of completeness */
export async function isUserVenueOwner(supabase: SupabaseClient, venueURL: string) {
    console.log("Chimpanzini banini, ", venueURL);

    try {
        const { data, error } = await runRPC(supabase, FN_IS_VENUE_OWNER, { p_venue_url: venueURL });
        console.log(data, error);
        console.log("Donkey kong");
        return !error && data === true;
    } catch (err) {
        console.error("RPC threw:", err);
        return false;
    }
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
        if (!ext || !(ext in VENUE_IMAGE_BUCKET_FORMATS)) throw Error('Unsupported image format.');
        const fileName = `${VENUE_IMAGE_BUCKET_PREFIX}-${index + 1}_${Date.now()}.${ext}`;
        const { error } = await supabase.storage
            .from(VENUE_IMAGE_BUCKET_PATH)
            .upload(`${venueID}/${fileName}`, files[index], { upsert: true });
        if (error) throw Error("Image mismatch | upload error");
        const publicUrl = supabase.storage
            .from(VENUE_IMAGE_BUCKET_PATH)
            .getPublicUrl(`${venueID}/${fileName}`).data.publicUrl;
        urls.push(publicUrl);
    }
    console.log(`we got urls as ${urls}`);
    
    return urls;
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
    const settingsResponse = await runRPC(supabase, FN_VENUE_GENERAL_SETTINGS_GET, { p_venue_id: venueID, p_image_urls: newImagePaths })
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