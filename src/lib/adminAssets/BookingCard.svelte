<script lang="ts">
	import type { BookingEntry } from "../../types/bookingTypes";

	export let booking: BookingEntry;
	export let selected = false;
	export let onClick = () => {};
	export let getStatusBadgeClass;
	export let formatDate;
</script>

<div
	class="card w-full cursor-pointer border border-base-300 bg-base-200 hover:bg-base-300 sm:w-fit"
	class:ring-2={selected}
	class:ring-primary={selected}
	on:click={onClick}
	role="button"
	tabindex="0"
	on:keydown={(e) => e.key === 'Enter' && onClick()}
>
	<div class="card-body p-3">
		<div class="flex items-center justify-between gap-2">
			<span class="text-sm font-semibold">#{booking.details.bookingID}</span>
			<span class="badge badge-sm {getStatusBadgeClass(booking.details.status)}">{booking.details.status}</span>
		</div>
		<div class="text-xs opacity-70">
			<div>Unit: {booking.details.unitName}</div>
			<div>Start: {formatDate(booking.details.startTime)}</div>
			<div>End: {formatDate(booking.details.endTime)}</div>
		</div>
	</div>
</div>
