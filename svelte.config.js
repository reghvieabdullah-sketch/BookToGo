import netlify from '@sveltejs/adapter-netlify';
import { vitePreprocess } from '@sveltejs/vite-plugin-svelte';

const config = {
	preprocess: vitePreprocess(),
	kit: {
		adapter: netlify({
			// disable automatic _headers generation
			headers: undefined,
			redirects: undefined // optional, if you also don't need redirects
		})
	}
};

export default config;
