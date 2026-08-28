<script lang="ts">
	import { invalidate } from '$app/navigation';
	import AllBookings from '$lib/adminAssets/allBookings.svelte';
	import PaymentsInfo from '$lib/adminAssets/paymentsInfo.svelte';
	import Schedulings from '$lib/adminAssets/schedulings.svelte';
	import SettingsInfo from '$lib/adminAssets/settingsInfo.svelte';
	import ContactDetails from '$lib/configAssets/contactDetails.svelte';
	import CourtsPricing from '$lib/configAssets/courtsPricing.svelte';
	import FeatureCards from '$lib/configAssets/featureCards.svelte';
	import GeneralInfo from '$lib/configAssets/generalInfo.svelte';
	import ImageManager from '$lib/configAssets/imageManager.svelte';
	import {
		courtStatusEnum,
		INVALIDATE_PARENT_LAYOUT_CODE
	} from '$lib/constants/postgressFunctionConstants';
	import equal from 'fast-deep-equal';

	let activeSection = 'bookings';
	let drawerOpen = false;
	let isUpdatingConfig = false;
	let finishedUpdating = false;
	let imageBlobs: Blob[];
	let generalDropdownOpen = false;

	export let data;

	// take a copy of the stores. we dont want to cause problems where the owner would see the changes and assume that the changes have taken place.
	let venueDataCopy = structuredClone(data.venueData);
	let courtDataCopy = structuredClone(data.courtsData);
	let venueSettingsCopy = structuredClone(data.settingsData);

	async function getFormData(): Promise<FormData> {
		const formData = new FormData();
		imageBlobs.forEach((blob, index) => {
			const fileName = `homepage-${index + 1}.${blob.type.split('/')[1] || 'jpg'}`;
			const file = new File([blob], fileName, { type: blob.type });
			formData.append('files', file);
		});
		return formData;
	}
	async function updateVenueConfig() {
		// NOTE - add better error handling and progress indicators, showing the update progress, additionally add reactive updates IF all responses return true
		isUpdatingConfig = true;
		finishedUpdating = false;
		try {
			let responses: Response[] = [];
			const venueID = data.venueData.venueID;
			if (!equal(data.courtsData, courtDataCopy)) {
				responses.push(
					await fetch(`/api/v1/venues/${venueID}/courts`, {
						method: 'PUT',
						headers: {
							'Content-Type': 'application/json'
						},
						body: JSON.stringify(courtDataCopy)
					})
				);
			}
			if (!equal(data.venueData, venueDataCopy)) {
				responses.push(
					await fetch(`/api/v1/venues/${venueID}`, {
						method: 'PUT',
						headers: {
							'Content-Type': 'application/json'
						},
						body: JSON.stringify(venueDataCopy)
					})
				);
			}
			if (!equal(data.settingsData, venueSettingsCopy)) {
				responses.push(
					await fetch(`/api/v1/venues/${venueID}/settings`, {
						method: 'PUT',
						headers: {
							'Content-Type': 'application/json'
						},
						body: JSON.stringify(venueSettingsCopy)
					})
				);
			}
			if (imageBlobs) {
				responses.push(
					await fetch(`/api/v1/venues/${venueID}/media`, {
						method: 'PUT',
						body: await getFormData()
					})
				);
			}
			if (responses.every((val) => val.ok)) {
				finishedUpdating = true;
				// invalidate the parent layout to refetch the updated data
				await invalidate(INVALIDATE_PARENT_LAYOUT_CODE);
				// then reset the vars
				venueDataCopy = structuredClone(data.venueData);
				courtDataCopy = structuredClone(data.courtsData);
				venueSettingsCopy = structuredClone(data.settingsData);
			}
		} catch (error) {
			console.error('Error updating config:', error);
		} finally {
			isUpdatingConfig = false;
		}
	}

	// Main navigation sections (frequently used)
	const mainSections = [
		{
			id: 'bookings',
			name: 'All Bookings',
			component: AllBookings,
			props: {}
		},
		{
			id: 'schedulings',
			name: 'Schedulings & Closures',
			component: Schedulings,
			props: {}
		},
		{
			id: 'courts',
			name: 'Courts & Pricing',
			component: CourtsPricing,
			props: { courts: courtDataCopy }
		},
		{
			id: 'settings',
			name: 'Settings',
			component: SettingsInfo,
			props: { settings: venueSettingsCopy }
		}, 
			// {
			// id: 'payment',
			// name: 'payment',
			// component: PaymentsInfo,
			// props: {  }
		// }
	];

	// General configuration sections (dropdown)
	const generalSections = [
		{
			id: 'general',
			name: 'General Info',
			component: GeneralInfo,
			props: {
				venueName: venueDataCopy.venueBrand,
				venueSlogan: venueDataCopy.venueSlogan,
				venueIconPreview: venueDataCopy.venueLogo
			}
		},
		{
			id: 'images',
			name: 'Image Manager',
			component: ImageManager,
			props: { homePageImages: venueDataCopy.venueCourtCarouselImages }
		},
		{
			id: 'features',
			name: 'Feature Cards',
			component: FeatureCards,
			props: { whyChooseUsCards: venueDataCopy.venueDescription }
		},
		{
			id: 'contact',
			name: 'Contact Details',
			component: ContactDetails,
			props: { contactDetails: venueDataCopy.venueContactDetails }
		}
	];

	function setActiveSection(sectionId: string) {
		activeSection = sectionId;
		drawerOpen = false;
		// Close general dropdown if selecting a main section
		if (mainSections.find((s) => s.id === sectionId)) {
			generalDropdownOpen = false;
		}
	}

	$: currentSection = [...mainSections, ...generalSections].find((s) => s.id === activeSection);
	$: currentSectionName = currentSection?.name || '';
</script>

<div class="min-h-screen bg-base-200">
	<!-- Mobile Header with Drawer Toggle -->
	<div class="navbar bg-base-100 shadow-sm lg:hidden">
		<div class="flex-none">
			<button class="btn btn-square btn-ghost" on:click={() => (drawerOpen = !drawerOpen)}>
				<svg class="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
					<path
						stroke-linecap="round"
						stroke-linejoin="round"
						stroke-width="2"
						d="M4 6h16M4 12h16M4 18h16"
					/>
				</svg>
			</button>
		</div>
		<h1 class="pointer-events-none absolute w-full text-center text-xl font-bold text-primary">
			Admin Panel
		</h1>
	</div>

	<div class="drawer lg:drawer-open">
		<input id="drawer-toggle" type="checkbox" class="drawer-toggle" bind:checked={drawerOpen} />

		<!-- Main Content -->
		<div class="drawer-content flex flex-col">
			<!-- Desktop Header -->
			<div class="hidden p-6 pb-0 lg:block">
				<h1 class="mb-2 text-3xl font-bold text-base-content">Admin Panel</h1>
				<div class="flex items-center justify-between">
					<p class="text-base-content/60">Manage your venue settings and bookings</p>
					<div class="text-right text-xs text-warning italic opacity-60 sm:text-sm">
						Need help? Call 0772716627
					</div>
				</div>
			</div>

			<!-- Main Content Area -->
			<div class="flex-1 p-6">
				<div class="mx-auto max-w-4xl">
					<!-- Content Header -->
					<div class="mb-4">
						<h2 class="text-2xl font-semibold text-base-content">{currentSectionName}</h2>
					</div>

					<!-- Content -->
					<div class="rounded-lg border border-base-300 bg-base-100 shadow-sm">
						{#if currentSection}
							<svelte:component
								this={currentSection.component}
								bind:venueID={venueDataCopy.venueID}
								bind:venueName={venueDataCopy.venueBrand}
								bind:venueSlogan={venueDataCopy.venueSlogan}
								bind:venueIconPreview={venueDataCopy.venueLogo}
								bind:homePageImages={venueDataCopy.venueCourtCarouselImages}
								bind:whyChooseUsCards={venueDataCopy.venueDescription}
								bind:contactDetails={venueDataCopy.venueContactDetails}
								bind:venueAddress={venueDataCopy.venueAddress}
								bind:courts={courtDataCopy}
								bind:imageBlobs
								bind:venueSettings={venueSettingsCopy}
								bind:closureData={data.closureData}
								bind:bookingDataDashboard={data.bookingDataDashboard}
							/>
						{/if}
					</div>
				</div>
			</div>
		</div>

		<!-- Sidebar / Drawer -->
		<div class="drawer-side">
			<label for="drawer-toggle" class="drawer-overlay lg:hidden"></label>
			<aside class="min-h-full w-80 border-r border-base-300 bg-base-100">
				<!-- Sidebar Header -->
				<div class="border-b border-base-300 p-6">
					<h2 class="text-xl font-bold text-base-content">Navigation</h2>
					<p class="mt-1 text-sm text-base-content/60">Venue management dashboard</p>
				</div>

				<!-- Navigation Menu -->
				<div class="space-y-2 p-4">
					<!-- Main Sections -->
					{#each mainSections as section}
						<button
							class="btn w-full justify-start text-left font-medium btn-ghost"
							class:btn-active={activeSection === section.id}
							on:click={() => setActiveSection(section.id)}
						>
							{section.name}
						</button>
					{/each}

					<!-- General Configuration Dropdown -->
					<div class="collapse-arrow collapse bg-base-200">
						<input type="checkbox" bind:checked={generalDropdownOpen} />
						<div class="collapse-title text-sm font-medium text-base-content/80">
							General Configuration
						</div>
						<div class="collapse-content space-y-2">
							{#each generalSections as section}
								<button
									class="btn w-full justify-start text-left btn-sm {activeSection === section.id
										? 'btn-active!'
										: 'btn-ghost'}"
									on:click={() => setActiveSection(section.id)}
								>
									{section.name}
								</button>
							{/each}
						</div>
					</div>

					<!-- Save Button -->
					<div class="pt-4">
						<button
							class="btn w-full font-medium btn-primary"
							on:click={updateVenueConfig}
							disabled={isUpdatingConfig}
						>
							{#if isUpdatingConfig}
								<span class="loading loading-sm loading-spinner"></span>
								Saving...
							{:else}
								Save Changes
							{/if}
						</button>
					</div>
				</div>

				<!-- Sidebar Footer with Current Section Info -->
				<div class="absolute right-0 bottom-0 left-0 border-t border-base-300 p-4">
					<div class="rounded-lg bg-info/10 p-4">
						<h4 class="mb-2 font-medium text-info">Current Section</h4>
						<p class="text-xs text-base-content/70">
							{#if activeSection === 'bookings'}
								View and manage all venue bookings and reservations.
							{:else if activeSection === 'courts'}
								Configure court availability, pricing, and booking settings.
							{:else if activeSection === 'general'}
								Update basic venue information and branding settings.
							{:else if activeSection === 'images'}
								Upload and manage venue images and media assets.
							{:else if activeSection === 'features'}
								Customize feature highlights displayed on your website.
							{:else if activeSection === 'contact'}
								Maintain up-to-date contact information for customers.
							{:else if activeSection === 'settings'}
								Customize the settings regarding booking & policies.
							{:else}
								Select a section to view management options.
							{/if}
						</p>
					</div>
				</div>
			</aside>
		</div>
	</div>
</div>

{#if isUpdatingConfig}
	<div class="modal-open modal">
		<div class="modal-box">
			<h3 class="mb-4 text-lg font-bold">Saving Changes</h3>
			<div class="flex items-center justify-center py-4">
				<span class="loading loading-lg loading-spinner text-primary"></span>
			</div>
			<p class="text-center text-base-content/60">
				Please wait while we update your configuration...
			</p>
		</div>
	</div>
{/if}
