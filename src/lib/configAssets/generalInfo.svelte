<script lang="ts">
	export let venueName = '';
	export let venueSlogan = '';
	export let venueIconPreview = '';
	export let venueAddress = '';
	export let venueIcon: File | null = null;
	// let venueIcon: File | null = null;
	function handleIconChange(event: Event) {
		const target = event.target as HTMLInputElement;
		const file = target.files?.[0];
		
		if (!file) return;

		venueIcon = file;
		const reader = new FileReader();
		reader.onload = (e) => {
			venueIconPreview = e.target?.result as string;
		};
		reader.readAsDataURL(file);
	}
</script>

<div class="card bg-base-100 shadow-xl">
	<div class="card-body p-4 sm:p-8">
		<h2 class="mb-4 sm:mb-6 card-title text-lg sm:text-2xl">General Info</h2>

		<div class="form-control w-full mb-3 sm:mb-4">
			<label class="label pb-1 sm:pb-2">
				<span class="label-text font-semibold text-sm sm:text-base">Venue Name</span>
			</label>
			<input
				type="text"
				bind:value={venueName}
				maxlength="30"
				placeholder="Enter venue name"
				class="input-bordered input w-full text-sm sm:text-base h-10 sm:h-12"
			/>
		</div>

		<div class="form-control w-full mb-3 sm:mb-4">
			<label class="label pb-1 sm:pb-2">
				<span class="label-text font-semibold text-sm sm:text-base">Venue Name</span>
			</label>
			<input
				type="text"
				bind:value={venueAddress}
				maxlength="100"
				placeholder="Enter venue address"
				class="input-bordered input w-full text-sm sm:text-base h-10 sm:h-12"
			/>
		</div>

		<div class="form-control w-full mb-3 sm:mb-4">
			<label class="label pb-1 sm:pb-2">
				<span class="label-text font-semibold text-sm sm:text-base">Venue Slogan</span>
			</label>
			<input
				type="text"
				bind:value={venueSlogan}
				placeholder="Enter venue slogan"
				maxlength="200"
				class="input-bordered input w-full text-sm sm:text-base h-10 sm:h-12"
			/>
		</div>

		<div class="form-control w-full">
			<label class="label pb-1 sm:pb-2">
				<span class="label-text font-semibold text-sm sm:text-base">Venue Icon</span>
			</label>
			<input
				type="file"
				accept="image/*"
				on:change={handleIconChange}
				class="file-input-bordered file-input w-full text-sm sm:text-base h-10 sm:h-12"
			/>
			{#if venueIconPreview}
				<div class="mt-2 sm:mt-4">
					<img
						src={venueIconPreview}
						alt="Venue Icon Preview"
						class="h-10 w-10 sm:h-12 sm:w-12 rounded object-cover"
					/>
				</div>
			{/if}
		</div>
	</div>
</div>