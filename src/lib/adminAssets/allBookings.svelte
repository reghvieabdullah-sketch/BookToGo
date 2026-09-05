<script lang="ts">
	import { onMount } from 'svelte';
	import { invalidate } from '$app/navigation';
	import BookingCard from './BookingCard.svelte';
	import type { BookingEntry } from '../../types/bookingTypes';
	import BookingInfo from './BookingInfo.svelte';
	import { getPaymentStatusBadgeClass, getStatusBadgeClass } from '$lib/utils/utils';
	import { QUERY_PARAM_BOOKING_EXCEL_REQUEST, QUERY_PARAM_VENUE_BOOKING_DATE_END, QUERY_PARAM_VENUE_BOOKING_DATE_START } from '$lib/constants/postgressFunctionConstants';

	let {
		bookingData,
		venueID
	}: {
		bookingData: Record<string, BookingEntry[]> | BookingEntry[];
		venueID: number;
	} = $props();

	function flatten(data: Record<string, BookingEntry[]> | BookingEntry[]) {
		const bookings = Array.isArray(data)
			? data
			: Object.values(data ?? {}).flat();

		return [...bookings].sort(
			(a, b) => new Date(a.details.startTime).getTime() - new Date(b.details.startTime).getTime()
	);
}

	// Local, mutable copy so we can remove entries after delete
	// without waiting on a full page invalidate/reload
	let bookings = $state<BookingEntry[]>(flatten(bookingData));
	
	// Keep local state in sync if the prop changes (e.g. after navigation)
	onMount(() => {
		bookings = flatten(bookingData);
	});

	
	let selectedBooking = $state<BookingEntry | null>(null);
	let isMobile = $state(false);
	let showMobileDetails = $state(false);
	let confirmationAction = $state<'paid' | 'delete' | null>(null);
	let selectedBookingIndex = $state<number | null>(null);
	onMount(() => {
		const checkMobile = () => {
			isMobile = window.innerWidth < 768;
		};

		checkMobile();
		window.addEventListener('resize', checkMobile);

		return () => {
			window.removeEventListener('resize', checkMobile);
		};
	});

	function selectBooking(booking: BookingEntry, index: number) {
		selectedBooking = booking;
		selectedBookingIndex = index;
		showMobileDetails = true;
	}

	function closeMobileDetails() {
		showMobileDetails = false;
		selectedBooking = null;
	}

	function formatDate(isoString: string | number | Date) {
		return (
			' ' + new Date(isoString).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
		);
	}

	function formatBookingDate(isoString: string | number | Date) {
		return new Date(isoString).toLocaleDateString([], {
			year: 'numeric',
			month: 'short',
			day: 'numeric'
		});
	}
	

	

	function handlePaid() {
		if (!selectedBooking) return;
		
		const booking = bookings.find(
			(b) => b.details.bookingID === selectedBooking?.details.bookingID
		);

		if (booking?.details.status === 'paid') return;

		confirmationAction = 'paid';
	}

	function handleDelete() {
		if (!selectedBooking) return;

		confirmationAction = 'delete';
	}

	function closeConfirmation() {
		confirmationAction = null;
	}

	async function confirmPaid() {
		if (!selectedBooking) return;

		const bookingID = selectedBooking.details.bookingID;
		const booking = bookings.find((b) => b.details.bookingID === bookingID);

		try {
			const payload = { bookingID, newStatus: 'paid' };

			const response = await fetch(`/api/v1/bookings/${venueID}`, {
				method: 'PATCH',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify(payload)
			});

			const success: boolean = await response.json();

			if (success) {
				if (booking) booking.details.status = 'paid';

				confirmationAction = null;
				selectedBooking = null;
				showMobileDetails = false;
			}
		} catch (error) {
			console.log(error);
		}
	}

	async function confirmDelete() {
		if (!selectedBooking) return;

		const bookingID = selectedBooking.details.bookingID;

		try {
			const payload = { bookingID };

			const response = await fetch(`/api/v1/bookings/${venueID}`, {
				method: 'DELETE',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify(payload)
			});

			const success: boolean = await response.json();

			if (success) {
				bookings = bookings.filter(
					(b) => b.details.bookingID !== bookingID
				);

				confirmationAction = null;
				selectedBooking = null;
				showMobileDetails = false;
			}
		} catch (error) {
			console.log(error);
		}
	}
	function getTimeStatus(startTime: string) {
		return new Date(startTime) > new Date() ? 'upcoming' : 'past';
	}

	let excelStartDate = $state('');
	let excelEndDate = $state('');
	let downloadingExcel = $state(false);
	let excelError = $state<string | null>(null);
	
	async function downloadBookingExcel() {
		if (!excelStartDate || !excelEndDate) return;
		
		excelError = null;
		downloadingExcel = true;
		const startDate = new Date(`${excelStartDate}T00:00:00.000Z`).toISOString();
		const endDate = new Date(`${excelEndDate}T23:59:59.999Z`).toISOString();

		const params = new URLSearchParams({
			[QUERY_PARAM_VENUE_BOOKING_DATE_START]: startDate,
			[QUERY_PARAM_VENUE_BOOKING_DATE_END]: endDate,
			[QUERY_PARAM_BOOKING_EXCEL_REQUEST]: 'true'
		});

		try {
			const response = await fetch(
				`/api/v1/bookings/${venueID}?${params}`
			);

			if (!response.ok) {
				const data = await response.json();
				excelError = data.error ?? 'No bookings within that range.';
				return;
			}

			const blob = await response.blob();

			const url = URL.createObjectURL(blob);
			const a = document.createElement('a');

			a.href = url;
			a.download = `bookings_${excelStartDate}_to_${excelEndDate}.xlsx`;

			a.click();

			URL.revokeObjectURL(url);
		} catch (error) {
			console.error(error);
			excelError = 'Something went wrong while downloading the file.';
		} finally {
			downloadingExcel = false;
		}
	}	

</script>
<div class="w-full p-2">
	<div class="card w-full bg-base-200 shadow-sm">
		<div class="card-body gap-5">
			<div class="flex flex-col gap-1">
				<h2 class="card-title">Export bookings</h2>
				<p class="text-sm text-base-content/60">
					Select a date range to download your bookings as an Excel file.
				</p>
			</div>

			<div class="flex flex-col gap-4 lg:flex-row lg:items-end">
				<!-- Date range -->
				<div class="grid flex-1 grid-cols-1 gap-4 sm:grid-cols-2">
					<label class="form-control w-full">
						<div class="label pb-1">
							<span class="label-text font-medium">Start date</span>
						</div>

						<input
							type="date"
							class="input input-bordered w-full"
							bind:value={excelStartDate}
						/>
					</label>

					<label class="form-control w-full">
						<div class="label pb-1">
							<span class="label-text font-medium">End date</span>
						</div>

						<input
							type="date"
							class="input input-bordered w-full"
							bind:value={excelEndDate}
						/>
					</label>
				</div>

				<!-- Download action -->
				<div class="lg:ml-auto">
					<button
						class="btn btn-primary w-full sm:w-auto lg:min-w-44"
						onclick={downloadBookingExcel}
						disabled={downloadingExcel}
					>
						{#if downloadingExcel}
							<span class="loading loading-spinner loading-sm"></span>
							Generating...
						{:else}
							Download Excel
						{/if}
					</button>
				</div>
			</div>

			{#if excelError}
				<div class="alert alert-error">
					<span>{excelError}</span>
				</div>
			{/if}
		</div>
	</div>
</div>
<div class="flex h-full flex-row gap-4">

	<div class="min-w-0 flex-1">
		<div class="flex flex-row flex-wrap gap-4 p-2">
			{#if bookings.length > 0}
				{#each bookings as booking, index (booking.details.bookingID)}
					<BookingCard
						{booking}
						{index}
						selected={selectedBooking?.details.bookingID === booking.details.bookingID}
						onClick={() => selectBooking(booking, index)}
						{getTimeStatus}
						{getStatusBadgeClass}
						{formatDate}
						{formatBookingDate}
					/>
				{/each}
			{:else}
				<div class="card card-body text-center text-2xl">No bookings just yet...</div>
			{/if}
		</div>
	</div>
</div>

<!-- Details Modal (mobile + desktop) -->
{#if showMobileDetails && selectedBooking}
	<div class="bg-opacity-50 fixed inset-0 z-50 flex items-center justify-center bg-black p-4">
		<BookingInfo
			booking={selectedBooking}
			onClose={closeMobileDetails}
			{getPaymentStatusBadgeClass}
			{getStatusBadgeClass}
			{formatBookingDate}
			{handleDelete}
			{formatDate}
			{handlePaid}
			{selectedBookingIndex} 

		/>
	</div>
{/if}


{#if confirmationAction && selectedBooking}
	<div class="bg-opacity-50 fixed inset-0 z-[60] flex items-center justify-center bg-black p-4">
		<div class="card w-full max-w-md bg-base-100 shadow-2xl">
			<div class="card-body">
				{#if confirmationAction === 'delete'}
					<h2 class="card-title text-error">Delete booking?</h2>

					<p class="text-base-content/70">
						Are you sure you want to delete this booking? This action cannot be undone.
					</p>

					<div class="card-actions mt-4 justify-end gap-2">
						<button
							class="btn btn-ghost"
							onclick={closeConfirmation}
						>
							Cancel
						</button>

						<button
							class="btn btn-error"
							onclick={confirmDelete}
						>
							Delete
						</button>
					</div>
				{:else}
					<h2 class="card-title">Mark booking as paid?</h2>

					<p class="text-base-content/70">
						Are you sure you want to mark this booking as paid?
					</p>

					<div class="card-actions mt-4 justify-end gap-2">
						<button
							class="btn btn-ghost"
							onclick={closeConfirmation}
						>
							Cancel
						</button>

						<button
							class="btn btn-success"
							onclick={confirmPaid}
						>
							Mark as Paid
						</button>
					</div>
				{/if}
			</div>
		</div>
	</div>
{/if}

