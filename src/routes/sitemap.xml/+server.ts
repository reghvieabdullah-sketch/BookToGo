
import { FN_VENUE_GET_INDEXABLE } from '$lib/constants/postgressFunctionConstants';
import type { RequestHandler } from './$types';

export const GET: RequestHandler = async ({ locals }) => {
	const { data: venues, error } = await locals.supabase.rpc(FN_VENUE_GET_INDEXABLE);
	if (error) {
		console.error('Failed to generate sitemap:', error);
		return new Response('Failed to generate sitemap', {
			status: 500
		});
	}

	const urls = [
		'https://booktogo.lk/',
		'https://booktogo.lk/contact',
		'https://booktogo.lk/privacy-policy',
		...(venues ?? []).flatMap(({ venue_url_name }) => [
			`https://${venue_url_name}.booktogo.lk/`,
			`https://${venue_url_name}.booktogo.lk/booking`
		])
	];

	const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${urls.map((url) => `	<url><loc>${url}</loc></url>`).join('\n')}
</urlset>`;

	return new Response(xml, {
		headers: {
			'Content-Type': 'application/xml; charset=utf-8',
			'Cache-Control': 'public, max-age=3600, s-maxage=3600'
		}
	});
};