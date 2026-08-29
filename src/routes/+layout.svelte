<script lang="ts">
	import '../app.css';
	// import favicon from '$lib/assets/favicon.svg';
	import { onMount } from 'svelte';
	import { goto, invalidate } from '$app/navigation';

	let { data, children } = $props();
	let { session, supabase, venueData, isVenueOwner } = $derived(data);
	function handleServerDownOrVenueIdFailure(error?: Error) {
		error ? goto(`/error?${error.message.replaceAll(' ', '_')}`) : goto('/');
	}
	$effect(() => {
		console.log(venueData);
	});

	onMount(() => {
		// if (!venueData) handleServerDownOrVenueIdFsailure();

		const { data } = supabase.auth.onAuthStateChange((_, newSession) => {
			if (newSession?.expires_at !== session?.expires_at) {
				invalidate('supabase:auth');
			}
		});
		return () => data.subscription.unsubscribe();
	});
</script>

<!-- <svelte:head> -->
	<!-- <link rel="icon" href={favicon} /> -->
<!-- </svelte:head> -->

<header class="sticky top-0 z-50 navbar bg-base-100 shadow">
	<div class="navbar-start">
		{#if venueData?.venueLogo && venueData.venueLogo !== ''}
			<img src={venueData.venueLogo} alt="logoImage" class="mt-2 mr-2 h-10 w-10 bg-base-100" />
		{/if}
		<span class="text-sm font-bold text-primary md:text-lg">{venueData?.venueBrand || ''}</span>
	</div>
	<!-- <div class="navbar-center hidden lg:flex">
		<ul class="menu menu-horizontal px-1">
			<li><a href="#facilities">Facilities</a></li>
			<li><a href="#about">About</a></li>
			<li><a href="#reviews">Reviews</a></li>
			<li><a href="#contact">Contact</a></li>
		</ul>
	</div> -->
	<div class="navbar-end gap-2">
			{#if isVenueOwner}
				<a href="/dashboard" class="btn btn-outline btn-primary">Dashboard</a>
			{:else}
				<a href="/mybookings" class="btn btn-primary">My Bookings</a>
			{/if}
	</div>
</header>

{@render children?.()}
