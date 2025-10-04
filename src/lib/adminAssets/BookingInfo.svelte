<script lang="ts">
	import type { BookingEntry } from "../../types/bookingTypes";

	export let booking: BookingEntry;
	export let onClose = () => {};
	export let getStatusBadgeClass;
	export let getPaymentStatusBadgeClass;
	export let formatDate;
	export let handleCancel;
	export let handleEdit;
</script>

<div class="card max-h-[90vh] w-full max-w-md overflow-y-auto bg-base-100">
	<div class="card-body p-4">
		<div class="mb-4 flex items-center justify-between">
			<h3 class="text-lg font-bold">Booking Details</h3>
			<button class="btn btn-circle btn-ghost btn-sm" on:click={onClose}> ✕ </button>
		</div>
		<div class="space-y-3">
			<div>
				<div class="flex items-center justify-between">
					<span class="font-semibold">Booking #{booking.details.bookingID}</span>
					<span class="badge {getStatusBadgeClass(booking.details.status)}">{booking.details.status}</span>
				</div>
				<div class="mt-1 text-sm opacity-70">Type: {booking.details.unitName}</div>
				<div class="mt-1 text-sm opacity-70">Units: {booking.details.units.join(', ')}</div>
			</div>
			<div class="divider my-2"></div>
			<div class="space-y-1 text-sm">
				<div><strong>Start:</strong> {formatDate(booking.details.startTime)}</div>
				<div><strong>End:</strong> {formatDate(booking.details.endTime)}</div>
			</div>
			<div class="divider my-2"></div>
			<div>
				<h4 class="mb-2 text-sm font-semibold">Customer</h4>
				<div class="space-y-1 text-sm">
					<div><strong>Name:</strong> {booking.user.name}</div>
					<div><strong>Email:</strong> {booking.user.email}</div>
					<div><strong>Phone:</strong> {booking.user.phone}</div>
				</div>
			</div>
			<div class="divider my-2"></div>
			<div>
				<h4 class="mb-2 text-sm font-semibold">Payment</h4>
				<div class="space-y-1 text-sm">
					<div class="flex items-center justify-between">
						<strong>Amount:</strong>
						<span class="font-mono">{booking.payment.currency} {booking.payment.amount.toFixed(2)}</span>
					</div>
					<div class="flex items-center justify-between">
						<strong>Method:</strong> <span>{booking.payment.paymentMethod}</span>
					</div>
					<div class="flex items-center justify-between">
						<strong>Status:</strong>
						<span class="badge badge-sm {getPaymentStatusBadgeClass(booking.payment.status)}">
							{booking.payment.status}
						</span>
					</div>
				</div>
			</div>
			<div class="divider my-2"></div>
			<div class="flex flex-row gap-2">
				<button class="btn flex-1 btn-sm btn-error" on:click={handleCancel}> Cancel </button>
				<button class="btn flex-1 btn-sm btn-primary" on:click={handleEdit}> Edit </button>
			</div>
		</div>
	</div>
</div>
