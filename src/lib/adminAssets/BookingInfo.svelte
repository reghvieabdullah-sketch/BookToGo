<script lang="ts">
	import { calculateTotalPrice } from "$lib/bookingLogic";
	import type { BookingEntry } from "../../types/bookingTypes";

	export let booking: BookingEntry;
	export let onClose = () => {};
	export let getStatusBadgeClass;
	export let getPaymentStatusBadgeClass;
	export let formatDate;
	export let handleCancel;
	export let handleDelete;
	export let formatBookingDate;
</script>

<div class="card max-h-[90vh] w-full max-w-md overflow-y-auto bg-base-100">
	<div class="card-body p-3 sm:p-4">
		<!-- Header -->
		<div class="mb-2 flex items-center justify-between sm:mb-4">
			<h3 class="text-base font-bold sm:text-lg">Booking Details</h3>

			<button class="btn btn-circle btn-ghost btn-xs sm:btn-sm" on:click={onClose}>
				✕
			</button>
		</div>

		<div class="space-y-2 sm:space-y-3">

			<!-- Booking -->
			<div>
				<div class="flex items-center justify-between gap-2">
					<span class="text-sm font-semibold sm:text-base">
						Booking #{booking.details.bookingID}
					</span>

					<span class="badge badge-sm {getStatusBadgeClass(booking.details.status)}">
						{booking.details.status}
					</span>
				</div>

				<div class="mt-0.5 text-xs opacity-70 sm:mt-1 sm:text-sm">
					Type: {booking.details.units.title}
				</div>

				<div class="mt-0.5 text-xs opacity-70 sm:mt-1 sm:text-sm">
					Units: {booking.details.units.subUnits.map(s => s.description).join(', ')}
				</div>

				<div class="mt-0.5 text-xs opacity-70 sm:mt-1 sm:text-sm">
					Price: Rs.{calculateTotalPrice(booking.details.units.subUnits, (new Date(booking.details.endTime).getTime() - new Date(booking.details.startTime).getTime()) / (1000 * 60 * 60))}
				</div>
			</div>

			<div class="divider my-1 sm:my-2"></div>

			<!-- Date & Time -->
			<div class="space-y-0.5 text-xs sm:space-y-1 sm:text-sm">
				<div>
					<strong>Date:</strong> {formatBookingDate(booking.details.startTime)}
				</div>

				<div>
					<strong>Start:</strong> {formatDate(booking.details.startTime)}
				</div>

				<div>
					<strong>End:</strong> {formatDate(booking.details.endTime)}
				</div>
			</div>

			<div class="divider my-1 sm:my-2"></div>

			<!-- Customer -->
			<div>
				<h4 class="mb-1 text-xs font-semibold sm:mb-2 sm:text-sm">
					Customer
				</h4>

				<div class="space-y-0.5 text-xs sm:space-y-1 sm:text-sm">
					<div>
						<strong>Name:</strong> {booking.user.name}
					</div>

					<!-- <div class="break-all">
						<strong>Email:</strong> {booking.user.email}
					</div> -->

					<div>
						<strong>Phone:</strong> {booking.user.phone}
					</div>
				</div>
			</div>

			<!-- Payment -->
			{#if booking.payment}
				<div class="divider my-1 sm:my-2"></div>

				<div>
					<h4 class="mb-1 text-xs font-semibold sm:mb-2 sm:text-sm">
						Payment
					</h4>

					<div class="space-y-0.5 text-xs sm:space-y-1 sm:text-sm">
						<div class="flex items-center justify-between gap-2">
							<strong>Amount:</strong>

							<span class="font-mono">
								{booking.payment.currency}
								{booking.payment.amount?.toFixed(2)}
							</span>
						</div>

						<div class="flex items-center justify-between gap-2">
							<strong>Method:</strong>

							<span class="truncate">
								{booking.payment.paymentMethod}
							</span>
						</div>

						<div class="flex items-center justify-between gap-2">
							<strong>Status:</strong>

							<span class="badge badge-xs sm:badge-sm {getPaymentStatusBadgeClass(booking.payment.status)}">
								{booking.payment.status}
							</span>
						</div>
					</div>
				</div>
			{/if}

			<div class="divider my-1 sm:my-2"></div>

			<!-- Actions -->
			<div class="flex flex-row gap-2">
				<button
					class="btn btn-sm flex-1 btn-error"
					on:click={handleCancel}
				>
					Back
				</button>

				<button
					class="btn btn-sm flex-1 btn-primary"
					on:click={handleDelete}
				>
					Delete
				</button>
			</div>
		</div>
	</div>
</div>
