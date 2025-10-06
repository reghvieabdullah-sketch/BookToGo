import netlify from '@sveltejs/adapter-netlify';
import { vitePreprocess } from '@sveltejs/vite-plugin-svelte';

/** @type {import('@sveltejs/kit').Config} */
const config = {
	preprocess: vitePreprocess(),
	kit: {
		adapter: netlify(),
		// optional: you can specify build options if needed
		// target: '#svelte', // if using an older SvelteKit version
	}
};

export default config;
