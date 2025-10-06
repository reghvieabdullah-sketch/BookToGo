import adapter from '@sveltejs/adapter-netlify';

export default {
	kit: {
		adapter: adapter({
			split: false,       // optional, prevents Edge Functions split
			redirects: undefined,
			headers: undefined
		})
	}
};
