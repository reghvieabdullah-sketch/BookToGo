<script lang="ts">
	const CREATE_VENUE_ENDPOINT = `/api/v1/venues/`;


	let venueName = $state('');
	let isCreating = $state(false);
	let createError = $state('');
	let createResult = $state<string | null>(null);

	let generatedUrl = $state('');
	let copied = $state(false);

	async function handleCreate() {
		const name = venueName.trim();
		if (!name || isCreating) return;

		isCreating = true;
		createError = '';
		createResult = null;
		// A fresh venue invalidates any previously generated URL.
		generatedUrl = '';

		try {
			const res = await fetch(CREATE_VENUE_ENDPOINT + venueName, {method: 'POST', headers: { 'Content-Type': 'application/json' }});

			if (!res.ok) {
				const body = await res.json().catch(() => null);
				throw new Error(body?.message || `Request failed (${res.status})`);
			}

			const obj = (await res.json()).data;
            console.log(obj)
            createResult = obj.inviteURL;
			venueName = '';
		} catch (err) {
			createError = err instanceof Error ? err.message : 'Something went wrong creating the venue.';
		} finally {
			isCreating = false;
		}
	}

	function handleGenerateUrl() {
		// The create endpoint already returns the venue's URL — this just reveals it.
		if (!createResult) return;
		copied = false;
		generatedUrl = createResult;
	}

	async function handleCopy() {
		if (!generatedUrl) return;
		try {
			await navigator.clipboard.writeText(generatedUrl);
			copied = true;
			setTimeout(() => (copied = false), 1500);
		} catch {
			// Clipboard API can fail without permission — the field is still selectable/copyable manually.
		}
	}
</script>

<div class="flex min-h-screen items-center justify-center bg-base-200 px-4 py-16">
	<div class="w-full max-w-sm">
		<div class="mb-6 text-center">
			<h1 class="text-2xl font-extrabold text-primary">Venue admin</h1>
			<p class="mt-1 text-sm opacity-60">Add a venue, then generate its booking link.</p>
		</div>

		<div class="divide-y divide-base-300 overflow-hidden rounded-2xl border border-base-300 bg-base-100 shadow-sm">
			<!-- Create venue -->
			<div class="p-5">
				<label for="venue-name" class="mb-1.5 block text-sm font-medium">Insert new venue name</label>

				<div class="flex gap-2">
					<input
						id="venue-name"
						type="text"
						bind:value={venueName}
						placeholder="e.g. Riverside Courts"
						class="input-bordered input h-11 min-h-0 flex-1"
						disabled={isCreating}
						onkeydown={(e) => e.key === 'Enter' && handleCreate()}
					/>
					<button
						type="button"
						class="btn h-11 min-h-0 shrink-0 px-5 btn-primary"
						onclick={handleCreate}
						disabled={isCreating || !venueName.trim()}
					>
						{#if isCreating}
							<span class="loading loading-xs loading-spinner"></span>
						{:else}
							Create
						{/if}
					</button>
				</div>

				{#if createError}
					<p class="mt-2.5 text-sm text-error">{createError}</p>
				{:else if createResult}
					<div class="mt-2.5 flex items-center gap-1.5 text-sm text-success">
						<span>✓</span>
						<span>{createResult.venueBrand} created</span>
					</div>
				{/if}
			</div>

			<!-- Generate URL -->
			<div class="p-5">
				<div class="flex items-center justify-between gap-3">
					<div>
						<p class="text-sm font-medium">Booking link</p>
						{#if !createResult}
							<p class="mt-0.5 text-xs opacity-50">Create a venue above first</p>
						{/if}
					</div>
					<button
						type="button"
						class="btn h-11 min-h-0 shrink-0 px-5 btn-outline btn-secondary"
						onclick={handleGenerateUrl}
						disabled={!createResult}
					>
						Generate URL
					</button>
				</div>

				{#if generatedUrl}
					<div class="mt-3 flex gap-2">
						<input
							type="text"
							readonly
							value={generatedUrl}
							class="input-bordered input h-11 min-h-0 flex-1 font-mono text-xs"
							onclick={(e) => e.currentTarget.select()}
							aria-label="Generated venue URL"
						/>
						<button
							type="button"
							class="btn h-11 min-h-0 w-16 shrink-0 btn-ghost"
							onclick={handleCopy}
							aria-label="Copy URL to clipboard"
						>
							{copied ? 'Copied' : 'Copy'}
						</button>
					</div>
				{/if}
			</div>
		</div>
	</div>
</div>