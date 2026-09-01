import { updateVenueImages, uploadVenueLogoImage } from "$lib/dbFunctions/venuesDB";
import { json, type RequestHandler } from "@sveltejs/kit";

export const PUT: RequestHandler = async ({ locals, request, params }) => {
    const { venueID } = params;
    const formData = await request.formData();
    console.log("In venue media uploader :)");
    
    const files = formData.getAll("files").filter((file): file is File => file instanceof File);
    const logo = formData.getAll("logo").find((file): file is File => file instanceof File);

    const [imageResult, logoResult] = await Promise.all([
        files.length > 0
            ? updateVenueImages(locals.supabase, venueID, files)
            : null,
        logo
            ? uploadVenueLogoImage(locals.supabase, venueID, logo)
            : null,
    ]);

    if (imageResult?.error) {
        return json({ error: imageResult.error }, { status: 400 });
    }

    if (logoResult?.error) {
        return json({ error: logoResult.error }, { status: 400 });
    }

    console.log("Leaving! Yeah im sleepy asf");
    

    return json({
        images: imageResult?.data ?? null,
        logo: logoResult?.data ?? null,
    });
};
