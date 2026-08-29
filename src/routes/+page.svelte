<script lang="ts">
	import { onMount } from 'svelte';

	const onTestMode = false;
	let carouselElement: HTMLDivElement;
	let showStickyButton = $state(false);
	let heroSection: HTMLElement;
	let isNavigating = $state(false);

	let { data } = $props();
	let {  venueData } = $derived(data);

	function isImagePath(icon: string) {
		return icon.includes('/') || icon.includes('.');
	}

	// Function to open Google Maps with venue location
	function openGoogleMaps() {
		const address = venueData?.venueAddress || venueData?.venueBrand || 'venue location';
		const mapsUrl = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(address)}`;
		window.open(mapsUrl, '_blank');
	}

	// Handle sticky button visibility
	function handleScroll() {
		if (heroSection) {
			const heroRect = heroSection.getBoundingClientRect();
			// Show sticky button when hero section is mostly out of view
			showStickyButton = heroRect.bottom < window.innerHeight * 0.3;
		}
	}

	import { goto } from '$app/navigation';
	import {
		QUERY_PARAM_BOOKING_DATE,
		QUERY_PARAM_VENUE_ID
	} from '$lib/constants/postgressFunctionConstants';

	onMount(() => {
		window.addEventListener('scroll', handleScroll);
		handleScroll(); // Initial check

		return () => {
			window.removeEventListener('scroll', handleScroll);
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
			// Navigate to /booking with query params
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

<div class="bg-base-100">
	<!-- Navbar -->

	<!-- Hero -->
	<section
		bind:this={heroSection}
		class="text-soft-content flex min-h-screen items-center justify-center bg-gradient-to-br from-primary/8 via-transparent to-secondary/6 px-4 text-center"
	>
		<div class="flex w-full max-w-5xl flex-col items-center justify-center">
			<!-- Left: copy -->
			<div class="md:pl-8">
				<h1 class="mb-4 text-3xl leading-tight font-extrabold md:text-5xl">
					{venueData?.venueBrand || 'Book your Court!'}
				</h1>
				<p class="text-muted mb-6 px-6 text-sm md:text-lg">
					Booking a court with {venueData?.venueBrand || 'us'} has never been easier. Experience seamless
					booking, top-notch facilities, and unforgettable moments every time.
				</p>

				<ul class="hidden gap-2 md:inline">
					<li class="badge bg-green-600 text-success-content">Real-time availability</li>
					<li class="badge bg-yellow-400 text-error-content">Secure payments</li>
					<li class="badge bg-orange-300 text-error-content">Instant confirmations</li>
				</ul>
			</div>

			<!-- Right: form card -->
			<form
				on:submit={submit}
				class="max-w-2xl rounded-2xl border border-white/6 bg-base-100/60 p-6 shadow-2xl backdrop-blur-md"
			>
				<div class="text-muted mb-3 text-left text-sm">Quick search — choose a court type</div>

				<div class="flex flex-col gap-3 sm:flex-row">
					<!-- Start -->
					<select class="select select-primary" disabled={isNavigating}>
						<option>Half Court</option>
						<option>Full Court</option>
					</select>
					<!-- Next button -->
					<button
						type="submit"
						class="btn flex shrink-0 items-center gap-3 px-5 btn-primary"
						aria-label="Next — go to booking"
						disabled={isNavigating}
					>
						{#if isNavigating}
							<span class="loading loading-sm loading-spinner"></span>
						{:else}
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
					<p class="text-muted mt-3 text-xs">You'll be taken to booking with the selected type.</p>
				{/if}
			</form>
		</div>
	</section>

	<!-- Carousel -->
	<section class="bg-base-100 py-12">
		<h2 class="mb-8 text-center text-3xl font-bold">Our Premium Facilities</h2>
		<div class="carousel w-full" bind:this={carouselElement}>
			{#if venueData}
				{#each venueData!.venueCourtCarouselImages as src, i}
					<div id="slide{i}" class="relative carousel-item flex w-full justify-center">
						<div
							class="h-64 w-full overflow-hidden sm:h-80 md:h-96 md:w-[80vw] lg:h-[500px] xl:h-[600px]"
						>
							<img {src} class="h-full w-full object-cover" alt={src} loading="lazy" />
						</div>
						<div
							class="absolute top-1/2 right-5 left-5 flex -translate-y-1/2 transform justify-between"
						>
							<a
								href="#slide{i === 0 ? venueData!.venueCourtCarouselImages.length - 1 : i - 1}"
								class="btn btn-circle btn-outline btn-soft">❮</a
							>
							<a
								href="#slide{(i + 1) % venueData!.venueCourtCarouselImages.length}"
								class="btn btn-circle btn-outline btn-soft">❯</a
							>
						</div>
					</div>
				{/each}
			{/if}
		</div>
		{#if venueData}
			<div class="flex justify-center py-2">
				{#each venueData!.venueCourtCarouselImages as _, i}
					<a href="#slide{i}" class="btn mx-1 btn-outline btn-xs">
						{i + 1}
					</a>
				{/each}
			</div>
		{/if}
	</section>

	<!-- Features -->
	<section id="facilities" class="py-12">
		<h2 class="mb-8 text-center text-3xl font-bold text-primary">
			Why {venueData?.venueBrand || 'choose us'}?
		</h2>
		<div class="flex flex-wrap justify-center gap-6">
			{#if venueData}
				{#each venueData.venueDescription as feature}
					<div class="card w-full max-w-sm bg-base-100 shadow">
						<div class="card-body text-center">
							{#if isImagePath(feature.icon)}
								<img src={feature.icon} alt={feature.title} class="mx-auto mb-4 h-12 w-12" />
							{:else if feature.icon !== 'default'}
								<div class="mb-4 text-3xl">{feature.icon}</div>
							{/if}

							<h3 class="card-title justify-center">{feature.title}</h3>
							<p class="opacity-70">{feature.description}</p>
						</div>
					</div>
				{/each}
			{/if}
		</div>
	</section>

	<!-- Location Section -->
	{#if !onTestMode}
		<section id="location" class="bg-base-200 py-12">
			<div class="container mx-auto px-4">
				<h2 class="mb-8 text-center text-3xl font-bold text-primary">Find Us Here</h2>
				<div class="flex flex-col items-center gap-8 lg:flex-row lg:justify-center">
					<!-- Map Container -->
					<div class="w-full max-w-2xl">
						<div class="card bg-base-100 shadow-lg">
							<div class="card-body p-0">
								<div class="h-64 w-full overflow-hidden rounded-t-2xl md:h-80">
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
										<!-- Placeholder when no address is available -->
										<div class="flex h-full items-center justify-center bg-base-300">
											<div class="text-center">
												<div class="mb-2 text-4xl">📍</div>
												<p class="text-base-content/60">Location map will appear here</p>
											</div>
										</div>
									{/if}
								</div>
								<div class="p-6">
									<div class="text-center">
										<h3 class="mb-2 text-xl font-semibold">
											{venueData?.venueBrand || 'Our Location'}
										</h3>
										{#if venueData?.venueAddress}
											<p class="mb-4 text-base-content/70">{venueData.venueAddress}</p>
										{/if}
										<button on:click={openGoogleMaps} class="btn gap-2 btn-primary">
											<span class="text-lg">🗺️</span>
											Open in Google Maps
										</button>
									</div>
								</div>
							</div>
						</div>
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
					class="btn w-full transform gap-2 shadow-lg transition-all duration-200 btn-lg btn-primary hover:scale-105 hover:shadow-xl"
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
	<footer class="footer bg-base-200 p-10 pb-40 text-base-content sm:footer-horizontal">
		<aside>
			{#if venueData?.venueLogo && venueData.venueLogo !== ''}
				<img src={venueData.venueLogo} alt="logoImage" class="h-10 w-10" />
			{/if}
			<p>
				{venueData?.venueBrand}
				<br />
				{venueData?.venueSlogan}
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