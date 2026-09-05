<script lang="ts">
	import Seo from '$lib/adminAssets/Seo.svelte';
	import { calculateTotalPrice } from '$lib/bookingLogic';
	import { getStatusBadgeClass } from '$lib/utils/utils';
	import type { BookingDetails } from '../../types/bookingTypes';
	import type { PageData } from './$types';

	let { data }: { data: PageData } = $props();

	const contactDetails = $derived(data.contactDetails || []);

	// Extract bookings with a fallback
	let bookings: BookingDetails[] = $derived(data.bookings || []);
	let venueID: string = $derived(data.venueID || '');

	// Cancel-confirmation dialog state
	let showConfirmDialog = $state(false);
	let bookingPendingCancel: BookingDetails | null = $state(null);
	let isCancelling = $state(false);

	// Result dialog state
	let showResultDialog = $state(false);
	let resultSuccess = $state(false);
	let resultMessage = $state('');

	function formatDate(isoString: string): string {
		const date = new Date(isoString);
		return date.toLocaleDateString('en-US', {
			weekday: 'short',
			month: 'short',
			day: 'numeric',
			year: 'numeric'
		});
	}

	function formatTime(isoString: string): string {
		const date = new Date(isoString);
		return date.toLocaleTimeString('en-US', {
			hour: '2-digit',
			minute: '2-digit'
		});
	}

	function getDuration(start: string, end: string): string {
		const startDate = new Date(start);
		const endDate = new Date(end);
		const minutes = Math.floor(
			(endDate.getTime() - startDate.getTime()) / (1000 * 60)
		);
		const hours = Math.floor(minutes / 60);
		const mins = minutes % 60;

		return hours > 0 ? `${hours}h ${mins}m` : `${mins}m`;
	}



	function getContactHref(contact: {
		icon?: string;
		title?: string;
		description?: string;
	}): string {
		const type = (contact.icon || contact.title || '').toLowerCase();
		const value = contact.description?.trim() || '';

		if (type === 'phone' || type === 'tel' || type === 'telephone') {
			return `tel:${value.replace(/\s+/g, '')}`;
		}

		if (type === 'email' || type === 'mail') {
			return `mailto:${value}`;
		}

		return '';
	}

	function getContactIcon(contact: {
		icon?: string;
		title?: string;
	}): string {
		const type = (contact.icon || contact.title || '').toLowerCase();

		if (type === 'phone' || type === 'tel' || type === 'telephone') {
			return 'phone';
		}

		if (type === 'email' || type === 'mail') {
			return 'email';
		}

		return 'contact';
	}

	// Step 1: user clicks "Cancel Booking" -> open confirmation dialog
	function requestCancel(booking: BookingDetails) {
		bookingPendingCancel = booking;
		showConfirmDialog = true;
	}

	function dismissConfirmDialog() {
		if (isCancelling) return;

		showConfirmDialog = false;
		bookingPendingCancel = null;
	}

	// Step 2: user confirms in the dialog -> actually call the API
	async function confirmCancel() {
		if (!bookingPendingCancel) return;

		const booking = bookingPendingCancel;
		const bookingID = booking.bookingID;

		if (!bookingID) return;

		isCancelling = true;

		try {
			const payload = { bookingID };

			const response = await fetch(`/api/v1/bookings/${venueID}`, {
				method: 'DELETE',
				headers: {
					'Content-Type': 'application/json'
				},
				body: JSON.stringify(payload)
			});

			// API returns a plain boolean indicating whether deletion succeeded
			const success: boolean = await response.json();

			if (success) {
				bookings = bookings.filter((b) => b.bookingID !== bookingID);
				resultSuccess = true;
				resultMessage = `Booking #${bookingID} has been cancelled.`;
			} else {
				resultSuccess = false;
				resultMessage = `We couldn't cancel booking #${bookingID}. Please try again.`;
			}
		} catch (error) {
			resultSuccess = false;
			resultMessage =
				'Something went wrong while cancelling your booking. Please try again.';
		} finally {
			isCancelling = false;
			showConfirmDialog = false;
			bookingPendingCancel = null;
			showResultDialog = true;
		}
	}

	function closeResultDialog() {
		showResultDialog = false;
	}
</script>

<Seo image={'https://booktogo.lk/logo.png'} title={`${data.venueData.venueBrand} | Bookings`} description={`See your bookings with ${data.venueData.venueBrand}`} url={`https://${data.venueURL}.booktogo.lk/mybookings`} noindex={true}/>

<div class="min-h-screen bg-base-200 p-4 md:p-8">
	<div class="mx-auto w-full max-w-6xl space-y-6">

		<!-- Contact / Help Section -->
		{#if contactDetails.length > 0}
			<div class="card border border-base-300 bg-base-100 shadow-md">
				<div class="card-body p-5 md:p-6">

					<div class="mb-4 flex items-start gap-3">
						<div class="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-primary/10 text-primary">
							<svg
								class="h-5 w-5"
								fill="none"
								stroke="currentColor"
								viewBox="0 0 24 24"
							>
								<path
									stroke-linecap="round"
									stroke-linejoin="round"
									stroke-width="2"
									d="M18 10c0 3.866-3.582 7-8 7a9.863 9.863 0 01-4-.8L3 17l1.8-3.2A6.875 6.875 0 012 9c0-3.866 3.582-7 8-7s8 3.134 8 7zm-6 8c3.866 0 7-1.79 7-4m0 0c0-1.657-1.343-3-3-3h-1m4 3c0 1.657-1.343 3-3 3h-1"
								/>
							</svg>
						</div>

						<div>
							<h2 class="text-lg font-bold md:text-xl">
								Need help?
							</h2>

							<p class="text-sm text-base-content/60">
								Contact the venue if you have any questions about your booking.
							</p>
						</div>
					</div>

					<!-- Contact methods -->
					<div class="grid grid-cols-1 gap-3 sm:grid-cols-2">
						{#each contactDetails as contact}
							{@const href = getContactHref(contact)}
							{@const icon = getContactIcon(contact)}

							{#if href}
								<a
									href={href}
									class="group flex min-w-0 items-center gap-3 rounded-xl border border-base-300 bg-base-200/40 p-4 transition-all hover:border-primary hover:bg-primary/5 hover:shadow-sm active:scale-[0.99]"
								>
									<div
										class="flex h-11 w-11 shrink-0 items-center justify-center rounded-lg bg-base-100 text-primary shadow-sm"
									>
										{#if icon === 'phone'}
											<svg
												class="h-5 w-5"
												fill="none"
												stroke="currentColor"
												viewBox="0 0 24 24"
											>
												<path
													stroke-linecap="round"
													stroke-linejoin="round"
													stroke-width="2"
													d="M3 5a2 2 0 012-2h3.28a1 1 0 011.897.632l1.045 3.135a1 1 0 01-.502 1.21l-2.12 1.06a11.042 11.042 0 005.349 5.349l1.06-2.12a1 1 0 011.21-.502l3.135 1.045A1 1 0 0121 9.72V13a2 2 0 01-2 2h-1C9.716 15 4 9.284 4 2V2a2 2 0 012-2z"
												/>
											</svg>
										{:else if icon === 'email'}
											<svg
												class="h-5 w-5"
												fill="none"
												stroke="currentColor"
												viewBox="0 0 24 24"
											>
												<path
													stroke-linecap="round"
													stroke-linejoin="round"
													stroke-width="2"
													d="M3 8l9 6 9-6M5 5h14a2 2 0 012 2v10a2 2 0 01-2 2H5a2 2 0 01-2-2V7a2 2 0 012-2z"
												/>
											</svg>
										{:else}
											<svg
												class="h-5 w-5"
												fill="none"
												stroke="currentColor"
												viewBox="0 0 24 24"
											>
												<path
													stroke-linecap="round"
													stroke-linejoin="round"
													stroke-width="2"
													d="M18 9v3m0 0v3m0-3h3m-3 0h-3M7 3a4 4 0 100 8 4 4 0 000-8zm0 8c-2.761 0-5 1.567-5 3.5V17h10v-2.5C12 12.567 9.761 11 7 11z"
												/>
											</svg>
										{/if}
									</div>

									<div class="min-w-0 flex-1">
										<div class="mb-0.5 text-xs font-medium uppercase tracking-wide text-base-content/50">
											{contact.title}
										</div>

										<div class="truncate font-semibold text-base-content group-hover:text-primary">
											{contact.description}
										</div>
									</div>

									<svg
										class="h-4 w-4 shrink-0 text-base-content/30 transition-transform group-hover:translate-x-0.5 group-hover:text-primary"
										fill="none"
										stroke="currentColor"
										viewBox="0 0 24 24"
									>
										<path
											stroke-linecap="round"
											stroke-linejoin="round"
											stroke-width="2"
											d="M9 5l7 7-7 7"
										/>
									</svg>
								</a>
							{:else}
								<div
									class="flex min-w-0 items-center gap-3 rounded-xl border border-base-300 bg-base-200/40 p-4"
								>
									<div
										class="flex h-11 w-11 shrink-0 items-center justify-center rounded-lg bg-base-100 text-primary shadow-sm"
									>
										<svg
											class="h-5 w-5"
											fill="none"
											stroke="currentColor"
											viewBox="0 0 24 24"
										>
											<path
												stroke-linecap="round"
												stroke-linejoin="round"
												stroke-width="2"
												d="M18 9v3m0 0v3m0-3h3m-3 0h-3M7 3a4 4 0 100 8 4 4 0 000-8zm0 8c-2.761 0-5 1.567-5 3.5V17h10v-2.5C12 12.567 9.761 11 7 11z"
											/>
										</svg>
									</div>

									<div class="min-w-0">
										<div class="mb-0.5 text-xs font-medium uppercase tracking-wide text-base-content/50">
											{contact.title}
										</div>

										<div class="break-all font-semibold">
											{contact.description}
										</div>
									</div>
								</div>
							{/if}
						{/each}
					</div>
				</div>
			</div>
		{/if}

		<!-- Bookings -->
		<div class="card bg-base-100 shadow-xl">
			<div class="card-body">
				<h2 class="mb-6 card-title text-2xl font-bold md:text-3xl">
					My Bookings
				</h2>

				{#if bookings.length === 0}
					<div class="py-8 text-center">
						<svg
							class="mx-auto mb-4 h-16 w-16 text-base-300"
							fill="none"
							stroke="currentColor"
							viewBox="0 0 24 24"
						>
							<path
								stroke-linecap="round"
								stroke-linejoin="round"
								stroke-width="2"
								d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
							/>
						</svg>

						<p class="text-base-content/60">
							No bookings found
						</p>
					</div>
				{:else}
					<div class="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
						{#each bookings as booking (booking.bookingID)}
							<div
								class="flex flex-col rounded-lg border border-base-300 p-4 transition-colors hover:border-primary hover:shadow-md"
							>
								<!-- Header -->
								<div class="mb-3 flex items-start justify-between">
									<div>
										<div class="text-lg font-semibold">
											Booking #{booking.bookingID}
										</div>

									</div>

									<div class="badge {getStatusBadgeClass(booking.status)} badge-sm">
										{booking.status}
									</div>
								</div>

								<!-- Date & Time -->
								<div class="mb-3 space-y-2">
									<div class="text-sm text-base-content">
										Total Price: Rs. {calculateTotalPrice(booking.units.subUnits, (new Date(booking.endTime!).getTime() - new Date(booking.startTime!).getTime()) / (1000 * 60 * 60))}
									</div>
									<div class="flex items-center gap-2 text-sm">
										<svg
											class="h-4 w-4 text-base-content/60"
											fill="none"
											stroke="currentColor"
											viewBox="0 0 24 24"
										>
											<path
												stroke-linecap="round"
												stroke-linejoin="round"
												stroke-width="2"
												d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2-2v12a2 2 0 002 2z"
											/>
										</svg>

										<span class="font-medium">
											{formatDate(booking.startTime)}
										</span>
									</div>

									<div class="flex items-center gap-2 text-sm">
										<svg
											class="h-4 w-4 text-base-content/60"
											fill="none"
											stroke="currentColor"
											viewBox="0 0 24 24"
										>
											<path
												stroke-linecap="round"
												stroke-linejoin="round"
												stroke-width="2"
												d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
											/>
										</svg>

										<span>
											{formatTime(booking.startTime)} -
											{formatTime(booking.endTime)}
										</span>

										<span class="text-base-content/60">
											({getDuration(booking.startTime, booking.endTime)})
										</span>
									</div>
								</div>

								<!-- Units -->
								<div class="mb-3">
									<div class="mb-1 text-xs text-base-content/60">
										Units:
									</div>

									<div class="mb-1">
										<div class="mb-1 badge badge-outline badge-sm">
											{booking.units.title}
										</div>
									</div>
								</div>

								<!-- Court Status -->
								<div class="mb-3 flex items-center gap-2 text-sm">
									<span class="text-base-content/60">
										Court Status:
									</span>

									<span class="font-medium capitalize">
										{booking.courtStatus}
									</span>
								</div>

								<!-- Cancel Button -->
								<button
										class="btn mt-auto w-full btn-outline btn-sm btn-error"
										onclick={() => requestCancel(booking)}
									>
										Cancel Booking
								</button>
							</div>
						{/each}
					</div>
				{/if}
			</div>
		</div>
	</div>
</div>

<!-- Confirmation Dialog -->
<dialog class="modal" class:modal-open={showConfirmDialog}>
	<div class="modal-box">
		<div class="mb-4 flex items-start gap-3">
			<div class="rounded-full bg-warning/15 p-2 text-warning">
				<svg
					class="h-6 w-6"
					fill="none"
					stroke="currentColor"
					viewBox="0 0 24 24"
				>
					<path
						stroke-linecap="round"
						stroke-linejoin="round"
						stroke-width="2"
						d="M12 9v3.75m0 3.75h.007v.008H12v-.008zM21 12a9 9 0 11-18 0 9 9 0 0118 0z"
					/>
				</svg>
			</div>

			<div>
				<h3 class="text-lg font-bold">
					Cancel this booking?
				</h3>

				{#if bookingPendingCancel}
					<p class="mt-1 text-sm text-base-content/70">
						Booking #{bookingPendingCancel.bookingID} on
						{formatDate(bookingPendingCancel.startTime)} at
						{formatTime(bookingPendingCancel.startTime)} will be cancelled.
						This can't be undone.
					</p>
				{/if}
			</div>
		</div>

		<div class="modal-action">
			<button
				class="btn btn-ghost"
				onclick={dismissConfirmDialog}
				disabled={isCancelling}
			>
				Keep Booking
			</button>

			<button
				class="btn btn-error"
				onclick={confirmCancel}
				disabled={isCancelling}
			>
				{#if isCancelling}
					<span class="loading loading-sm loading-spinner"></span>
					Cancelling...
				{:else}
					Yes, Cancel It
				{/if}
			</button>
		</div>
	</div>

	<button
		class="modal-backdrop"
		aria-label="Close dialog"
		onclick={dismissConfirmDialog}
		disabled={isCancelling}
	></button>
</dialog>

<!-- Result Dialog -->
<dialog class="modal" class:modal-open={showResultDialog}>
	<div class="modal-box">
		<div class="mb-2 flex items-start gap-3">
			{#if resultSuccess}
				<div class="rounded-full bg-success/15 p-2 text-success">
					<svg
						class="h-6 w-6"
						fill="none"
						stroke="currentColor"
						viewBox="0 0 24 24"
					>
						<path
							stroke-linecap="round"
							stroke-linejoin="round"
							stroke-width="2"
							d="M9 12.75l2.25 2.25 4.5-4.5m4.5 2.25a9 9 0 11-18 0 9 9 0 0118 0z"
						/>
					</svg>
				</div>
			{:else}
				<div class="rounded-full bg-error/15 p-2 text-error">
					<svg
						class="h-6 w-6"
						fill="none"
						stroke="currentColor"
						viewBox="0 0 24 24"
					>
						<path
							stroke-linecap="round"
							stroke-linejoin="round"
							stroke-width="2"
							d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126zM12 15.75h.007v.008H12v-.008z"
						/>
					</svg>
				</div>
			{/if}

			<div>
				<h3 class="text-lg font-bold">
					{resultSuccess ? 'Booking Cancelled' : 'Cancellation Failed'}
				</h3>

				<p class="mt-1 text-sm text-base-content/70">
					{resultMessage}
				</p>
			</div>
		</div>

		<div class="modal-action">
			<button
				class="btn {resultSuccess ? 'btn-success' : 'btn-error'}"
				onclick={closeResultDialog}
			>
				Done
			</button>
		</div>
	</div>

	<button
		class="modal-backdrop"
		aria-label="Close dialog"
		onclick={closeResultDialog}
	></button>
</dialog>