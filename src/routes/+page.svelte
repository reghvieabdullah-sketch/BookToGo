<script lang="ts">
	import { onMount } from 'svelte';

	const onTestMode = false;
	let carouselElement: HTMLDivElement;
	let showStickyButton = $state(false);
	let heroSection: HTMLElement;
	let isNavigating = $state(false);
	let activeSlide = $state(0);

	// Hero background crossfade
	let heroBgIndex = $state(0);
	let heroBgInterval: ReturnType<typeof setInterval> | undefined;

	let { data } = $props();
	let { venueData } = $derived(data);

	function isImagePath(icon: string) {
		return icon.includes('/') || icon.includes('.');
	}

	function openGoogleMaps() {
		const address = venueData?.venueAddress || venueData?.venueBrand || 'venue location';
		const mapsUrl = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(address)}`;
		window.open(mapsUrl, '_blank');
	}

	function handleScroll() {
		if (heroSection) {
			const heroRect = heroSection.getBoundingClientRect();
			showStickyButton = heroRect.bottom < window.innerHeight * 0.3;
		}
	}

	import { goto } from '$app/navigation';
	import {
		QUERY_PARAM_BOOKING_DATE,
		QUERY_PARAM_VENUE_ID
	} from '$lib/constants/postgressFunctionConstants';
	import Hompage from '$lib/hompage.svelte';
	import Seo from '$lib/adminAssets/Seo.svelte';

	onMount(() => {
		window.addEventListener('scroll', handleScroll);
		handleScroll();

		const images = venueData?.venueCourtCarouselImages;
		if (images?.length > 1) {
			heroBgInterval = setInterval(() => {
				heroBgIndex = (heroBgIndex + 1) % images.length;
			}, 5000);
		}

		return () => {
			window.removeEventListener('scroll', handleScroll);
			if (heroBgInterval) clearInterval(heroBgInterval);
		};
	});

	let start = '';
	let end = '';
	let error = '';

	async function submit(e: Event) {
		e.preventDefault();
		if (isNavigating) return;
		isNavigating = true;
		try {
			await goto(
				`/booking?${QUERY_PARAM_VENUE_ID}=${venueData?.venueID || ''}&${QUERY_PARAM_BOOKING_DATE}=${new Date().toISOString().split('T')[0]}`
			);
		} finally {
			isNavigating = false;
		}
	}

	async function goToBooking(e: Event) {
		e.preventDefault();
		if (isNavigating) return;
		isNavigating = true;
		try {
			await goto('/booking');
		} finally {
			isNavigating = false;
		}
	}
	// why so much error handling? cause the venue owner are just dumb and will most likely
	// not provide all the venueData needed to render the page properly
</script>

{#if data.venueURL}
	<Seo
    image="https://booktogo.lk/logo.png"
    title={`${data.venueURL} | BookToGo`}
    description={`Discover ${data.venueURL} on BookToGo. Explore available services, check details, and book your next experience easily online.`}
    url={`https://${data.venueURL}.booktogo.lk`}
	/>
<div class="min-h-screen bg-base-100">
	
	<section
		bind:this={heroSection}
		class="relative flex min-h-screen items-center justify-center overflow-hidden px-4 py-24"
	>
		<!-- Background: carousel photos if available, decorative gradient otherwise -->
		<div class="pointer-events-none absolute inset-0 -z-10">
			{#if venueData?.venueCourtCarouselImages?.length}
				{#each venueData.venueCourtCarouselImages as src, i}
					<img
						{src}
						alt=""
						class="absolute inset-0 h-full w-full object-cover transition-opacity duration-1000 ease-in-out"
						style="opacity: {i === heroBgIndex ? 1 : 0}"
						loading={i === 0 ? 'eager' : 'lazy'}
					/>
				{/each}
				<!-- Overlay using daisyUI's neutral token for legibility -->
				<div class="absolute inset-0 bg-gradient-to-b from-neutral/75 via-neutral/55 to-neutral/85"></div>
				<div class="absolute inset-0 bg-gradient-to-br from-primary/20 via-transparent to-secondary/20"></div>
			{:else}
				<div class="absolute inset-0 bg-gradient-to-br from-primary/10 via-base-100 to-secondary/10"></div>
				<div class="absolute -top-32 -right-32 h-96 w-96 rounded-full bg-primary/20 blur-3xl"></div>
				<div class="absolute -bottom-32 -left-32 h-96 w-96 rounded-full bg-secondary/20 blur-3xl"></div>
			{/if}
		</div>

		<div class="mx-auto flex w-full max-w-4xl flex-col items-center gap-10 text-center">
			<!-- Copy -->
			<div class="flex flex-col items-center gap-5">
				{#if venueData?.venueLogo && venueData.venueLogo !== ''}
					<img
						src={venueData.venueLogo}
						alt="{venueData?.venueBrand} logo"
						class="h-16 w-16 rounded-2xl object-cover shadow-lg ring-4 ring-base-100"
					/>
				{/if}

				<h1 class="text-4xl leading-tight font-extrabold tracking-tight text-neutral-content drop-shadow-lg md:text-6xl">
					{venueData?.venueBrand || 'Book your Court!'}
				</h1>

				<p class="max-w-2xl text-balance text-base leading-relaxed text-neutral-content/85 drop-shadow md:text-lg">
					Booking a court with {venueData?.venueBrand || 'us'} has never been easier. Experience seamless
					booking, top-notch facilities, and unforgettable moments every time.
				</p>

				<ul class="hidden flex-wrap items-center justify-center gap-2 md:flex">
					<li class="badge badge-lg gap-1 border-0 bg-base-100/90 font-medium text-success shadow-sm">
						● Real-time availability
					</li>
					<li class="badge badge-lg gap-1 border-0 bg-base-100/90 font-medium text-warning shadow-sm">
						● Secure payments
					</li>
					<li class="badge badge-lg gap-1 border-0 bg-base-100/90 font-medium text-info shadow-sm">
						● Instant confirmations
					</li>
				</ul>
			</div>

			<!-- Booking card -->
			<form
				on:submit={submit}
				class="w-full max-w-xl rounded-3xl border border-base-100/20 bg-base-100/90 p-6 text-left shadow-2xl ring-1 ring-primary/10 backdrop-blur-xl md:p-8"
			>
				<div class="mb-4">
					<p class="text-sm font-semibold text-base-content">Find your court</p>
					<p class="text-xs text-base-content/60">Pick a court type to start your booking</p>
				</div>

				<div class="flex flex-col gap-3 sm:flex-row">
					<select
						class="select select-bordered w-full rounded-xl focus:select-primary"
						disabled={isNavigating}
					>
						<option>Full Court</option>
					</select>

					<button
						type="submit"
						class="btn shrink-0 gap-2 rounded-xl px-6 btn-primary"
						aria-label="Next — go to booking"
						disabled={isNavigating}
					>
						{#if isNavigating}
							<span class="loading loading-sm loading-spinner"></span>
							Loading
						{:else}
							Check availability
							<svg
								xmlns="http://www.w3.org/2000/svg"
								class="h-5 w-5"
								fill="none"
								viewBox="0 0 24 24"
								stroke="currentColor"
								stroke-width="2"
							>
								<path stroke-linecap="round" stroke-linejoin="round" d="M17 8l4 4m0 0l-4 4m4-4H3" />
							</svg>
						{/if}
					</button>
				</div>

				{#if error}
					<p class="mt-3 text-sm text-error">{error}</p>
				{:else}
					<p class="mt-3 text-xs text-base-content/50">You'll be taken to booking with the selected type.</p>
				{/if}
			</form>

			<!-- Scroll cue -->
			<svg
				class="h-6 w-6 animate-bounce text-neutral-content/60 drop-shadow"
				fill="none"
				viewBox="0 0 24 24"
				stroke="currentColor"
				stroke-width="2"
			>
				<path stroke-linecap="round" stroke-linejoin="round" d="M19 14l-7 7m0 0l-7-7m7 7V3" />
			</svg>
		</div>
	</section>

	<!-- Carousel -->
	{#if venueData?.venueCourtCarouselImages?.length}
		<section class="bg-base-100 py-16 md:py-24">
			<div class="mx-auto max-w-6xl px-4">
				<div class="mb-10 text-center">
					<p class="text-sm font-semibold tracking-wide text-primary uppercase">Take a look inside</p>
					<h2 class="mt-2 text-3xl font-bold text-base-content md:text-4xl">Our Premium Facilities</h2>
				</div>

				<div
					class="carousel w-full overflow-hidden rounded-3xl shadow-lg"
					bind:this={carouselElement}
				>
					{#each venueData.venueCourtCarouselImages as src, i}
						<div id="slide{i}" class="relative carousel-item w-full">
							<div class="h-64 w-full sm:h-80 md:h-[420px] lg:h-[520px]">
								<img {src} class="h-full w-full object-cover" alt="Facility view {i + 1}" loading="lazy" />
							</div>
							<div class="absolute inset-0 bg-gradient-to-t from-neutral/40 via-transparent to-transparent"></div>

							<div class="absolute top-1/2 right-4 left-4 flex -translate-y-1/2 justify-between">
								
									<a href="#slide{i === 0 ? venueData.venueCourtCarouselImages.length - 1 : i - 1}"
									class="btn btn-circle border-0 bg-base-100/80 text-base-content shadow backdrop-blur hover:bg-base-100"
								>❮</a>
								
									<a href="#slide{(i + 1) % venueData.venueCourtCarouselImages.length}"
									class="btn btn-circle border-0 bg-base-100/80 text-base-content shadow backdrop-blur hover:bg-base-100"
								>❯</a>
							</div>
						</div>
					{/each}
				</div>

				<div class="mt-6 flex justify-center gap-2">
					{#each venueData.venueCourtCarouselImages as _, i}
						
							<a href="#slide{i}"
							class="h-2.5 w-2.5 rounded-full bg-base-content/20 transition-all hover:bg-primary"
							aria-label="Go to slide {i + 1}"
						></a>
					{/each}
				</div>
			</div>
		</section>
	{/if}

	<!-- Features -->
	{#if venueData?.venueDescription?.length}
		<section id="facilities" class="bg-base-200/40 py-16 md:py-24">
			<div class="mx-auto max-w-6xl px-4">
				<div class="mb-12 text-center">
					<p class="text-sm font-semibold tracking-wide text-primary uppercase">Why choose us</p>
					<h2 class="mt-2 text-3xl font-bold text-base-content md:text-4xl">
						What makes {venueData?.venueBrand || 'us'} different
					</h2>
				</div>

				<div class="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
					{#each venueData.venueDescription as feature}
						<div
							class="group rounded-2xl border border-base-content/10 bg-base-100 p-6 text-center shadow-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-lg"
						>
							{#if isImagePath(feature.icon)}
								<img src={feature.icon} alt={feature.title} class="mx-auto mb-4 h-12 w-12 object-contain" />
							{:else if feature.icon !== 'default'}
								<div
									class="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-primary/10 text-3xl transition-colors group-hover:bg-primary/20"
								>
									{feature.icon}
								</div>
							{/if}

							<h3 class="text-lg font-semibold text-base-content">{feature.title}</h3>
							<p class="mt-2 text-sm leading-relaxed text-base-content/60">{feature.description}</p>
						</div>
					{/each}
				</div>
			</div>
		</section>
	{/if}

	<!-- Location Section -->
	{#if !onTestMode}
		<section id="location" class="bg-base-100 py-16 md:py-24">
			<div class="mx-auto max-w-4xl px-4">
				<div class="mb-10 text-center">
					<p class="text-sm font-semibold tracking-wide text-primary uppercase">Getting here</p>
					<h2 class="mt-2 text-3xl font-bold text-base-content md:text-4xl">Find Us Here</h2>
				</div>

				<div class="overflow-hidden rounded-3xl border border-base-content/10 bg-base-100 shadow-lg">
					<div class="h-64 w-full md:h-96">
						{#if venueData?.venueAddress || venueData?.venueBrand}
							<iframe
								src="https://www.google.com/maps/embed/v1/place?key=AIzaSyARYtZ_9ukYxOdqCMes7stPSiuNDxcFmaU&q={encodeURIComponent(
									venueData?.venueAddress || venueData?.venueBrand || ''
								)}"
								width="100%"
								height="100%"
								style="border:0;"
								allowfullscreen=""
								loading="lazy"
								referrerpolicy="no-referrer-when-downgrade"
								title="Venue Location"
							></iframe>
						{:else}
							<div class="flex h-full items-center justify-center bg-base-200">
								<div class="text-center">
									<div class="mb-2 text-4xl">📍</div>
									<p class="text-base-content/60">Location map will appear here</p>
								</div>
							</div>
						{/if}
					</div>

					<div class="flex flex-col items-center gap-3 p-8 text-center">
						<h3 class="text-xl font-semibold text-base-content">
							{venueData?.venueBrand || 'Our Location'}
						</h3>
						{#if venueData?.venueAddress}
							<p class="text-base-content/60">{venueData.venueAddress}</p>
						{/if}
						<button on:click={openGoogleMaps} class="btn mt-2 gap-2 rounded-xl btn-primary">
							<span class="text-lg">🗺️</span>
							Open in Google Maps
						</button>
					</div>
				</div>
			</div>
		</section>
	{/if}

	<!-- Sticky Book Button -->
	{#if showStickyButton}
		<div
			class="fixed right-0 bottom-0 left-0 z-40 bg-gradient-to-t from-base-100 via-base-100/95 to-transparent p-4 pb-6 transition-all duration-300 ease-in-out"
			style="backdrop-filter: blur(8px);"
		>
			<div class="mx-auto max-w-sm">
				<button
					on:click={goToBooking}
					disabled={isNavigating}
					class="btn w-full transform gap-2 rounded-xl shadow-lg transition-all duration-200 btn-lg btn-primary hover:scale-[1.02] hover:shadow-xl"
				>
					{#if isNavigating}
						<span class="loading loading-md loading-spinner"></span>
					{:else}
						<svg
							xmlns="http://www.w3.org/2000/svg"
							class="h-5 w-5"
							fill="none"
							viewBox="0 0 24 24"
							stroke="currentColor"
						>
							<path
								stroke-linecap="round"
								stroke-linejoin="round"
								stroke-width="2"
								d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 002 2z"
							/>
						</svg>
					{/if}
					{isNavigating ? 'Loading...' : 'Book Court'}
				</button>
			</div>
		</div>
	{/if}

	<!-- Footer -->
	<footer class="footer border-t border-base-content/10 bg-base-200/40 p-10 pb-40 text-base-content sm:footer-horizontal">
		<aside class="flex items-center gap-3">
			{#if venueData?.venueLogo && venueData.venueLogo !== ''}
				<img src={venueData.venueLogo} alt="logoImage" class="h-10 w-10 rounded-lg object-cover" />
			{/if}
			<p>
				<span class="font-semibold">{venueData?.venueBrand}</span>
				<br />
				<span class="text-base-content/60">{venueData?.venueSlogan}</span>
			</p>
		</aside>
		<nav>
			<h6 class="footer-title">Company</h6>
			<a class="link link-hover">About us</a>
			<a class="link link-hover">Contact</a>
		</nav>
		<nav>
			<h6 class="footer-title">Legal</h6>
			<a class="link link-hover">Terms of use</a>
			<a class="link link-hover">Privacy policy</a>
		</nav>
	</footer>
</div>
{:else}
	<Seo
	image="https://booktogo.lk/logo.png"
	title="BookToGo | Grow Your Sports Venue"
	description="Take your sports venue online with BookToGo. Manage bookings, showcase your courts, and make it easier for customers to find and reserve your venue."
	url="https://booktogo.lk"
	/>
	<Hompage/>
{/if}