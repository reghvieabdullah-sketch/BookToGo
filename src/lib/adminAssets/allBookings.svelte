<script lang="ts">
	import { onMount } from 'svelte';
	import { invalidate } from '$app/navigation';
	import BookingCard from './BookingCard.svelte';
	import type { BookingEntry } from '../../types/bookingTypes';
	import BookingInfo from './BookingInfo.svelte';

	let {
		bookingData,
		venueID
	}: {
		bookingData: Record<string, BookingEntry[]> | BookingEntry[];
		venueID: number;
	} = $props();

	// Flatten bookings if they're grouped by date
	const flattenedBookings = $derived(() => {
		if (Array.isArray(bookingData)) {
			return bookingData;
		}
		// If it's an object grouped by date, flatten it
		return Object.values(bookingData ?? {}).flat();
	});


	let selectedBooking = $state<BookingEntry | null>(null);
	let isMobile = $state(false);
	let showMobileDetails = $state(false);

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

	function selectBooking(booking: BookingEntry) {
		selectedBooking = booking;
		if (isMobile) {
			showMobileDetails = true;
		}
	}

	function closeMobileDetails() {
		showMobileDetails = false;
		selectedBooking = null;
	}

	function formatDate(isoString: string | number | Date) {
		return (
			// new Date(isoString).toLocaleDateString() +
			' ' + new Date(isoString).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
		);
	}

	function getStatusBadgeClass(status?: string) {
		switch (status && status.toLowerCase()) {
			case 'confirmed':
				return 'badge-success';
			case 'pending':
				return 'badge-warning';
			case 'cancelled':
				return 'badge-error';
			default:
				return 'badge-neutral';
		}
	}

	function getPaymentStatusBadgeClass(status: string) {
		switch (status.toLowerCase()) {
			case 'paid':
				return 'badge-success';
			case 'pending':
				return 'badge-warning';
			case 'refunded':
				return 'badge-info';
			default:
				return 'badge-neutral';
		}
	}

	async function handleCancel() {
		if (!selectedBooking) return;

		// Implement your cancel logic here
		// After successful cancellation:
		await invalidate('layout:dashboard');
	}

	async function handleEdit() {
		if (!selectedBooking) return;

		// Implement your edit logic here
		// After successful edit:
		await invalidate('layout:dashboard');
	}
</script>

<div class="flex h-full flex-row gap-4">
	<div class="min-w-0 flex-1">
		<div class="flex flex-row flex-wrap gap-4 p-2">
			{#if flattenedBookings().length > 0}
				{#each flattenedBookings() as booking}
					<BookingCard
						{booking}
						selected={selectedBooking?.details.bookingID === booking.details.bookingID && !isMobile}
						onClick={() => selectBooking(booking)}
						{getStatusBadgeClass}
						{formatDate}
					/>
				{/each}
			{:else}
				<div class="card card-body text-center text-2xl">No bookings just yet...</div>
			{/if}
		</div>
	</div>

	<!-- Second Column - Booking Details (Desktop) -->
	{#if selectedBooking && !isMobile}
		<div class="w-80 border-l border-base-300 pl-4">
			<div class="sticky top-0">
				<BookingInfo
					booking={selectedBooking}
					onClose={() => (selectedBooking = null)}
					{getStatusBadgeClass}
					{getPaymentStatusBadgeClass}
					{formatDate}
					{handleCancel}
					{handleEdit}
				/>
			</div>
		</div>
	{/if}
</div>

<!-- Mobile Details Modal -->
{#if showMobileDetails && selectedBooking && isMobile}
	<div class="bg-opacity-50 fixed inset-0 z-50 flex items-center justify-center bg-black p-4">
		<BookingInfo
			booking={selectedBooking}
			onClose={closeMobileDetails}
			{getStatusBadgeClass}
			{getPaymentStatusBadgeClass}
			{formatDate}
			{handleCancel}
			{handleEdit}
		/>
	</div>
{/if}
