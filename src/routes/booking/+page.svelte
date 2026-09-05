<script lang="ts">
	import BookingPopup from '$lib/bookingAssets/bookingPopup.svelte';
	import { browser } from '$app/environment';
	import {
		bookingPopupVisible,
		fadeDuration,
		isLoading,
		scaleDuration
	} from '$lib/bookingAssets/bookingStore.js';
	import Calender from '$lib/bookingAssets/Calender.svelte';
	import { fade, scale } from 'svelte/transition';
	import Seo from '$lib/adminAssets/Seo.svelte';
	let { data } = $props();

	$effect(() => {
		if (data.keepPopupOpen) {
			bookingPopupVisible.set(true);
		}
	});
</script>

<Seo
	image="https://booktogo.lk/logo.png"
	title={`Book ${data.venueData.venueBrand} | BookToGo`}
	description={`Book ${data.venueData.venueBrand} online with BookToGo. Check availability, view court options and prices, and reserve your preferred time slot instantly.`}
	url={`https://${data.venueURL}.booktogo.lk/booking`}
/>

<div
	class="relative flex h-[100vh] w-full flex-col items-center justify-center bg-base-300 px-4 sm:px-6 md:flex-row md:items-center md:justify-center lg:px-8"
>
	<Calender
		bookingData={data.bookingData}
		settingsData={data.settingsData}
		venueData={data.venueData}
	/>
	{#if ($bookingPopupVisible || (browser && window.innerWidth > 780))}
		<!-- svelte-ignore a11y_click_events_have_key_events -->
		<!-- svelte-ignore a11y_no_static_element_interactions -->
		<div
			on:click={(e) => e.target === e.currentTarget && ($bookingPopupVisible = false)}
			class="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 md:static md:bg-transparent md:p-0"
			transition:fade={{ duration: fadeDuration }}
		>
			<div
				class="w-full max-w-md md:pointer-events-auto md:max-w-none"
				transition:scale={{ duration: scaleDuration }}
			>
				<BookingPopup
					onclose={() => ($bookingPopupVisible = false)}
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
	{/if}
</div>
