<script lang="ts">
	import '../app.css';
	// import favicon from '$lib/assets/favicon.svg';
	import { onMount } from 'svelte';
	import { goto, invalidate } from '$app/navigation';

	let { data, children } = $props();
	let { session, supabase, venueData, isVenueOwner } = $derived(data);

	let avatarUrl = $derived(
		session?.user?.user_metadata?.avatar_url ?? session?.user?.user_metadata?.picture ?? null
	);

	let logoutDialog: HTMLDialogElement;

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

	function closeDropdown() {
		// blurs the active element so daisyUI's dropdown (which relies on :focus-within) closes
		if (document.activeElement instanceof HTMLElement) {
			document.activeElement.blur();
		}
	}

	function openLogoutConfirm() {
		closeDropdown();
		logoutDialog.showModal();
	}

	async function confirmLogout() {
		logoutDialog.close();
		await supabase.auth.signOut();
		await invalidate('supabase:auth');
		goto('/');
	}
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
			<a href="/booking" class="btn btn-primary">Book Now</a>
		{/if}

		{#if session}
			<div class="dropdown dropdown-end">
				<button tabindex="0" class="btn btn-ghost btn-circle avatar" aria-label="User menu">
					{#if avatarUrl}
						<div class="w-10 rounded-full">
							<img src={avatarUrl} alt="User avatar" referrerpolicy="no-referrer" />
						</div>
					{:else}
						<svg
							xmlns="http://www.w3.org/2000/svg"
							width="28"
							height="28"
							viewBox="0 0 24 24"
							fill="none"
							stroke="currentColor"
							stroke-width="2"
							stroke-linecap="round"
							stroke-linejoin="round"
						>
							<circle cx="12" cy="12" r="10" />
							<circle cx="12" cy="8" r="4" />
							<path d="M6 20.5C6.8 17.5 9.1 16 12 16s5.2 1.5 6 4.5" />
						</svg>
					{/if}
				</button>
				<ul
					tabindex="0"
					class="menu dropdown-content z-[1] mt-3 w-48 rounded-box bg-base-100 p-2 shadow"
				>
					<li><a href="/mybookings" onclick={closeDropdown}>My Bookings</a></li>
					<li><button onclick={openLogoutConfirm}>Logout</button></li>
				</ul>
			</div>
		{:else}
			<a href="/auth" class="btn btn-outline btn-primary">Login</a>
		{/if}
	</div>
</header>

<dialog bind:this={logoutDialog} class="modal">
	<div class="modal-box">
		<h3 class="text-lg font-bold">Log out?</h3>
		<p class="py-4">Are you sure you want to log out?</p>
		<div class="modal-action">
			<button class="btn" onclick={() => logoutDialog.close()}>Cancel</button>
			<button class="btn btn-error" onclick={confirmLogout}>Logout</button>
		</div>
	</div>
	<form method="dialog" class="modal-backdrop">
		<button>close</button>
	</form>
</dialog>

{@render children?.()}