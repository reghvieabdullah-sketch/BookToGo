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


<svelte:head>
<link rel="icon" href={venueData ? venueData.venueLogo : '/src/lib/logo.png'} />
</svelte:head>
{#if !venueData}
<div class="navbar mx-auto max-w-full px-4 py-5 sm:px-6 lg:px-8">
	<div class="navbar-start">
		<a href="/" class="flex items-center gap-2">
			<div
				class="flex size-10 items-center justify-center rounded-xl bg-primary text-primary-content shadow-lg"
			>
				<svg
					xmlns="http://www.w3.org/2000/svg"
					viewBox="0 0 24 24"
					fill="none"
					stroke="currentColor"
					stroke-width="2"
					class="size-5"
				>
					<path d="M6 3h12" />
					<path d="M6 3v4a6 6 0 0 0 12 0V3" />
					<path d="M12 13v8" />
					<path d="M8 21h8" />
				</svg>
			</div>

			<span class="text-xl font-black tracking-tight">BookToGo</span>
		</a>
	</div>

	<div class="navbar-end gap-2">
		<a href="#how-it-works" class="btn btn-ghost hidden sm:inline-flex">
			How it works
		</a>

		<a href="#get-started" class="btn btn-primary">
			Get started
		</a>
	</div>
</div>
{:else}
<div class="sticky top-0 z-50 navbar bg-base-100 shadow px-2 sm:px-4">
	<div class="navbar-start min-w-0">
		<a
			href="/"
			class="flex min-w-0 items-center gap-2 rounded-lg px-1 py-1 transition-opacity hover:opacity-80"
			aria-label="Go to homepage"
		>
			{#if venueData?.venueLogo && venueData.venueLogo !== ''}
				<img
					src={venueData.venueLogo}
					alt="{venueData?.venueBrand || 'Venue'} logo"
					class="h-8 w-8 shrink-0 rounded bg-base-100 sm:h-10 sm:w-10"
				/>
			{/if}
			<span class="truncate text-sm font-bold text-primary sm:text-lg">
				{venueData?.venueBrand || ''}
			</span>
		</a>
	</div>

	<!-- <div class="navbar-center hidden lg:flex">
		<ul class="menu menu-horizontal px-1">
			<li><a href="#facilities">Facilities</a></li>
			<li><a href="#about">About</a></li>
			<li><a href="#reviews">Reviews</a></li>
			<li><a href="#contact">Contact</a></li>
		</ul>
	</div> -->

	<div class="navbar-end gap-1 sm:gap-2">
		{#if isVenueOwner}
			<a href="/dashboard" class="btn btn-outline btn-primary btn-sm hidden sm:inline-flex sm:btn-md">
				Dashboard
			</a>
		{/if}

		<a href="/booking" class="btn btn-primary btn-sm sm:btn-md">
			<span class="hidden xs:inline">Book Now</span>
			<span class="xs:hidden">Book</span>
		</a>

		{#if session}
			<div class="dropdown dropdown-end">
				<button tabindex="0" class="btn btn-ghost btn-circle avatar btn-sm sm:btn-md" aria-label="User menu">
					{#if avatarUrl}
						<div class="w-8 rounded-full sm:w-10">
							<img src={avatarUrl} alt="User avatar" referrerpolicy="no-referrer" />
						</div>
					{:else}
						<svg
							xmlns="http://www.w3.org/2000/svg"
							width="24"
							height="24"
							viewBox="0 0 24 24"
							fill="none"
							stroke="currentColor"
							stroke-width="2"
							stroke-linecap="round"
							stroke-linejoin="round"
							class="sm:h-7 sm:w-7"
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
					{#if isVenueOwner}
						<li class="sm:hidden">
							<a href="/dashboard" onclick={closeDropdown}>Dashboard</a>
						</li>
					{/if}
					<li><a href="/mybookings" onclick={closeDropdown}>My Bookings</a></li>
					<li><button onclick={openLogoutConfirm}>Logout</button></li>
				</ul>
			</div>
		{:else}
			<a href="/auth" class="btn btn-outline btn-primary btn-sm sm:btn-md">
				<span class="hidden xs:inline">Login</span>
				<span class="xs:hidden">Log in</span>
			</a>
		{/if}
	</div>
</div>
{/if}

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

