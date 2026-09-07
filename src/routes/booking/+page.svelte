<script lang="ts">
	import BookingPopup from '$lib/bookingAssets/bookingPopup.svelte';
	import Calender from '$lib/bookingAssets/Calender.svelte';
	import Seo from '$lib/adminAssets/Seo.svelte';
	let { data } = $props();
</script>

<Seo
	image="https://booktogo.lk/logo.png"
	title={`Book ${data.venueData.venueBrand} | BookToGo`}
	description={`Book ${data.venueData.venueBrand} online with BookToGo. Check availability, view court options and prices, and reserve your preferred time slot instantly.`}
	url={`https://${data.venueURL}.booktogo.lk/booking`}
/>

<div class="min-h-screen bg-base-200/40 px-4 py-6 sm:px-6 lg:px-8">
	<div class="mx-auto w-full max-w-3xl">
		<div class="mb-6">
			<h1 class="text-2xl font-bold text-base-content sm:text-3xl">
				Book {data.venueData.venueBrand}
			</h1>
			<p class="mt-1 text-sm text-base-content/60">
				Pick a date, choose your court, and you're set in under a minute.
			</p>

			<!-- Scroll cue: hints there's a flow to follow below -->
			<div class="mt-3 flex items-center gap-2 text-xs font-medium text-base-content/40">
				<span>Follow the steps below</span>
				<svg
					class="h-4 w-4 animate-bounce"
					fill="none"
					stroke="currentColor"
					viewBox="0 0 24 24"
					aria-hidden="true"
				>
					<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 14l-7 7m0 0l-7-7m7 7V3" />
				</svg>
			</div>
		</div>

		<div class="space-y-6">
			<!-- Step 1: date -->
			<div class="relative pb-2 md:pl-11">
				<div
					class="hidden md:flex absolute left-0 top-0 flex h-8 w-8 items-center justify-center rounded-full border-2 border-primary bg-base-100 text-xs font-bold text-primary"
				>
					1
				</div>
				<div class="hidden md:flex absolute left-4 top-8 h-[calc(100%-1rem)] w-px bg-base-300" aria-hidden="true"></div>

				<h3 class="text-sm font-semibold text-base-content">Select date</h3>
				<p class="mb-3 text-xs text-base-content/50">
					Dimmed days are closed or already fully booked.
				</p>

				<Calender
					bookingData={data.bookingData}
					settingsData={data.settingsData}
					venueData={data.venueData}
				/>
			</div>

			<BookingPopup
				settingsData={data.settingsData}
				courtsData={data.courtsData}
				closureData={data.closureData}
				venueData={data.venueData}
				isLoggedIn={data.userLoggedIn}
				isVenueOwner={data.isVenueOwner}
				bookingState={data.bookingState}
			/>
		</div>
	</div>
</div>