<script lang="ts">
	import type { BookingDetails } from '../../types/bookingTypes';
	import type { PageData } from './$types';

	// Properly type your props using PageData
	let { data }: { data: PageData } = $props();

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
		const minutes = Math.floor((endDate.getTime() - startDate.getTime()) / (1000 * 60));
		const hours = Math.floor(minutes / 60);
		const mins = minutes % 60;
		return hours > 0 ? `${hours}h ${mins}m` : `${mins}m`;
	}

	function getStatusColor(status: string): string {
		const statusMap: Record<string, string> = {
			upcoming: 'badge-info',
			active: 'badge-success',
			pending: 'badge-warning',
			cancelled: 'badge-error',
			completed: 'badge-neutral'
		};
		return statusMap[status.toLowerCase()] || 'badge-ghost';
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
				headers: { 'Content-Type': 'application/json' },
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
			resultMessage = 'Something went wrong while cancelling your booking. Please try again.';
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

<div class="min-h-screen bg-base-200 p-4 md:p-8">
	<div class="mx-auto w-full max-w-6xl">
		<div class="card bg-base-100 shadow-xl">
			<div class="card-body">
				<h2 class="mb-6 card-title text-2xl font-bold md:text-3xl">My Bookings</h2>

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
						<p class="text-base-content/60">No bookings found</p>
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
										<div class="text-lg font-semibold">Booking #{booking.bookingID}</div>
										<div class="text-sm text-base-content/60">Court ID: {booking.courtID}</div>
									</div>
									<div class="badge {getStatusColor(booking.status!)} badge-sm">
										{booking.status}
									</div>
								</div>

								<!-- Date & Time -->
								<div class="mb-3 space-y-2">
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
												d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
											/>
										</svg>
										<span class="font-medium">{formatDate(booking.startTime)}</span>
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
										<span>{formatTime(booking.startTime)} - {formatTime(booking.endTime)}</span>
										<span class="text-base-content/60"
											>({getDuration(booking.startTime, booking.endTime)})</span
										>
									</div>
								</div>

								<!-- Units -->
								<div class="mb-3">
									<div class="mb-1 text-xs text-base-content/60">Units:</div>

									<div class="mb-1">
										<div class="mb-1 badge badge-outline badge-sm">
											{booking.units.title}
										</div>

										<ul class="ml-4 list-disc text-xs text-base-content/70">
											{#each booking.units.subUnits as sub}
												<li>{sub.description} - Rs.{sub.price}</li>
											{/each}
										</ul>
									</div>
								</div>

								<!-- Court Status -->
								<div class="mb-3 flex items-center gap-2 text-sm">
									<span class="text-base-content/60">Court Status:</span>
									<span class="font-medium capitalize">{booking.courtStatus}</span>
								</div>

								<!-- Cancel Button -->
								{#if booking.status!.toLowerCase() === 'upcoming' || booking.status!.toLowerCase() === 'active' || booking.status!.toLowerCase() === 'pending'}
									<button
										class="btn mt-auto w-full btn-outline btn-sm btn-error"
										onclick={() => requestCancel(booking)}
									>
										Cancel Booking
									</button>
								{/if}
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
				<svg class="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
					<path
						stroke-linecap="round"
						stroke-linejoin="round"
						stroke-width="2"
						d="M12 9v3.75m0 3.75h.007v.008H12v-.008zM21 12a9 9 0 11-18 0 9 9 0 0118 0z"
					/>
				</svg>
			</div>
			<div>
				<h3 class="text-lg font-bold">Cancel this booking?</h3>
				{#if bookingPendingCancel}
					<p class="mt-1 text-sm text-base-content/70">
						Booking #{bookingPendingCancel.bookingID} on {formatDate(
							bookingPendingCancel.startTime
						)} at {formatTime(bookingPendingCancel.startTime)} will be cancelled. This can't be
						undone.
					</p>
				{/if}
			</div>
		</div>

		<div class="modal-action">
			<button class="btn btn-ghost" onclick={dismissConfirmDialog} disabled={isCancelling}>
				Keep Booking
			</button>
			<button class="btn btn-error" onclick={confirmCancel} disabled={isCancelling}>
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
					<svg class="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
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
					<svg class="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
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
				<p class="mt-1 text-sm text-base-content/70">{resultMessage}</p>
			</div>
		</div>

		<div class="modal-action">
			<button class="btn {resultSuccess ? 'btn-success' : 'btn-error'}" onclick={closeResultDialog}>
				Done
			</button>
		</div>
	</div>
	<button class="modal-backdrop" aria-label="Close dialog" onclick={closeResultDialog}></button>
</dialog>