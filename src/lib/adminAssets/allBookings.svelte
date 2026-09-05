<script lang="ts">
	import { onMount } from 'svelte';
	import { invalidate } from '$app/navigation';
	import BookingCard from './BookingCard.svelte';
	import type { BookingEntry } from '../../types/bookingTypes';
	import BookingInfo from './BookingInfo.svelte';
	import { getPaymentStatusBadgeClass, getStatusBadgeClass } from '$lib/utils/utils';

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
</script>
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