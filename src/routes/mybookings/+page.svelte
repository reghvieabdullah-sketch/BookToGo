<script lang="ts">
	import type { BookingDetails } from '../../types/bookingTypes';
	import type { PageData } from './$types';

	// Properly type your props using PageData
	let { data }: { data: PageData } = $props();

	// Extract bookings with a fallback
	let bookings: BookingDetails[] = $derived(data.bookings || []);
	
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

	async function cancelBooking(bookingID: number | undefined) {
		console.log("IM MEOW MAXXING RN");
		
		if (!bookingID) return;
		console.log("GIGACHAD WHITE CAT");

		const confirmed = confirm(`Are you sure you want to cancel booking #${bookingID}?`);
		if (!confirmed) return;
		console.log("SAYS U STINK LIKE A POO POO HEAD");
		try {
			// Replace with your actual API call
			// await fetch(`/api/bookings/${bookingID}/cancel`, { method: 'POST' });

			bookings = bookings.filter((b) => b.bookingID !== bookingID);
			alert('Booking cancelled successfully!');
		} catch (error) {
			alert('Failed to cancel booking. Please try again.');
		}
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
										onclick={() => cancelBooking(booking.bookingID)}
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
