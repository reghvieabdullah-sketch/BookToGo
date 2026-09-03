<script lang="ts">
	import { VENUE_IMAGE_BUCKET_FORMATS } from "$lib/constants/postgressFunctionConstants";

	export let homePageImages: string[] = [];
	let selectedFiles: File[] = [];
	export let imageBlobs: Blob[];

	// Exported list of allowed formats (extensions without dot). Parent can override.
	export let allowedImageFormats: string[] = ['jpg', 'webp'];

	const IMAGE_MIME_MAP: Record<string, string> = {
		jpg: 'image/jpeg',
		jpeg: 'image/jpeg',
		png: 'image/png',
		webp: 'image/webp',
		gif: 'image/gif',
		svg: 'image/svg+xml',
		bmp: 'image/bmp',
		avif: 'image/avif',
		ico: 'image/vnd.microsoft.icon'
	};


	function generateExtToAccept(formats: string[]): Record<string, string[]> {
		const extToAccept: Record<string, string[]> = {};

		for (const ext of formats) {
			const mime = IMAGE_MIME_MAP[ext];
			if (!mime) continue;

			// handle jpg/jpeg grouping
			if (ext === 'jpg' || ext === 'jpeg') {
				extToAccept[ext] = ['.jpg', '.jpeg', 'image/jpeg'];
			} else {
				extToAccept[ext] = [`.${ext}`, mime];
			}
		}

		return extToAccept;
	}

	const extToAccept = generateExtToAccept(VENUE_IMAGE_BUCKET_FORMATS);

	// Build the accept string from allowedImageFormats
	function buildAcceptString(formats: string[]) {
		const tokens = new Set<string>();
		for (const f of formats) {
			const key = f.toLowerCase().replace(/^\./, '');
			if (extToAccept[key]) {
				extToAccept[key].forEach((t) => tokens.add(t));
			} else {
				// fallback to extension token
				tokens.add('.' + key);
			}
		}
		return Array.from(tokens).join(',');
	}

	const acceptString = buildAcceptString(allowedImageFormats);

	const MAX_FILE_SIZE = 2 * 1024 * 1024; // 2 MB

	function fileAllowed(file: File) {
		const lowerType = (file.type || '').toLowerCase();
		const name = file.name.toLowerCase();

		// Reject files >= 2 MB
		if (file.size >= MAX_FILE_SIZE) return false;

		// check mime type first
		for (const fmt of allowedImageFormats) {
			const key = fmt.toLowerCase().replace(/^\./, '');
			const tokens = extToAccept[key] ?? ['.' + key];

			if (tokens.some((t) => t.startsWith('image/') && lowerType === t)) {
				return true;
			}
		}

		// fallback to extension check
		return allowedImageFormats.some((fmt) => {
		const ext = fmt.toLowerCase().replace(/^\./, '');
		return name.endsWith('.' + ext) || (ext === 'jpg' && name.endsWith('.jpeg'));
	});
}
	async function addHomePageImage() {
		const input = document.createElement('input');
		input.type = 'file';
		input.multiple = true;
		input.accept = acceptString;
		input.onchange = async (e) => {
			const target = e.target as HTMLInputElement;
			if (!target.files) return;

			const incoming = Array.from(target.files);
			// filter to allowed formats
			const newFiles = incoming.filter((f) => fileAllowed(f));

			if (newFiles.length === 0) {
				// nothing allowed — you could show a UI toast here instead
				return;
			}

			selectedFiles.push(...newFiles);

			// wait until all FileReader tasks finish
			const results = await Promise.all(
				newFiles.map(
					(file) =>
						new Promise<string>((resolve) => {
							const reader = new FileReader();
							reader.onload = (event) => {
								resolve(event.target?.result as string);
							};
							reader.readAsDataURL(file);
						})
				)
			);

			// update images only after all are ready
			homePageImages = [...homePageImages, ...results];

			// NOW rebuild blobs
			await getAllImagesAsBlobs();
		};

		input.click();
	}

	function removeHomePageImage(index: number) {
		const removed = homePageImages[index];

		// Remove from homePageImages
		homePageImages = homePageImages.filter((_, i) => i !== index);

		// Remove from selectedFiles if it was a local file (data URL)
		if (removed.startsWith('data:')) {
			const fileIndex = selectedFiles.findIndex((f) => f.name && removed.includes(f.name));
			if (fileIndex >= 0) selectedFiles.splice(fileIndex, 1);
		}
		getAllImagesAsBlobs();
	}

	/** Returns all images as Blobs (local files + public URLs) */
	async function getAllImagesAsBlobs(): Promise<Blob[]> {
		const blobs: Blob[] = [];
		blobs.push(...selectedFiles);
		for (const img of homePageImages) {
			if (img.startsWith('data:')) continue;
			try {
				const response = await fetch(img);
				if (!response.ok) continue;
				const blob = await response.blob();
				blobs.push(blob);
			} catch (e) {
				console.error('Failed to fetch', img, e);
			}
		}

		imageBlobs = blobs;
		return blobs;
	}
</script>

<div class="card bg-base-100 shadow-xl">
	<div class="card-body p-4 sm:p-6">
		<h2 class="mb-4 card-title text-lg sm:mb-6 sm:text-2xl">Home Page Images</h2>

		<div
			class="grid grid-cols-2 gap-2 sm:grid-cols-3 sm:gap-4 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6"
		>
			{#each homePageImages as image, index}
				<div class="group relative aspect-square">
					<img
						src={image}
						alt="Home page {index + 1}"
						class="h-full w-full rounded-md object-cover shadow-md sm:rounded-lg"
					/>
					<button
						on:click={() => removeHomePageImage(index)}
						class="btn absolute -top-1 -right-1 btn-circle touch-manipulation opacity-0 transition-opacity btn-xs btn-error group-hover:opacity-100 sm:-top-2 sm:-right-2"
					>
						<svg
							xmlns="http://www.w3.org/2000/svg"
							class="h-3 w-3 sm:h-4 sm:w-4"
							fill="none"
							viewBox="0 0 24 24"
							stroke="currentColor"
						>
							<path
								stroke-linecap="round"
								stroke-linejoin="round"
								stroke-width="2"
								d="M6 18L18 6M6 6l12 12"
							/>
						</svg>
					</button>
				</div>
			{/each}

			<button
				on:click={addHomePageImage}
				class="flex aspect-square touch-manipulation items-center justify-center rounded-md border-2 border-dashed border-base-300 transition-colors hover:border-primary hover:bg-base-200 sm:rounded-lg"
			>
				<svg
					xmlns="http://www.w3.org/2000/svg"
					class="h-6 w-6 text-base-content sm:h-8 sm:w-8"
					fill="none"
					viewBox="0 0 24 24"
					stroke="currentColor"
				>
					<path
						stroke-linecap="round"
						stroke-linejoin="round"
						stroke-width="2"
						d="M12 4v16m8-8H4"
					/>
				</svg>
			</button>
		</div>
	</div>
</div>
