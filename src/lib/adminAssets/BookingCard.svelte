<script lang="ts">
	import { calculateTotalPrice } from "$lib/bookingLogic";
	import type { BookingEntry } from "../../types/bookingTypes";

	export let booking: BookingEntry;
	export let selected = false;
	export let onClick = () => {};
	export let getStatusBadgeClass;
	export let getTimeStatus;
	export let formatDate;
	export let formatBookingDate;
	export let index;
</script>

<div
	class="group w-full cursor-pointer rounded-xl border border-base-300 bg-base-100 transition-all duration-150 hover:-translate-y-0.5 hover:border-base-content/20 hover:shadow-md"
	class:border-primary={selected}
	class:ring-2={selected}
	
	on:click={onClick}
	role="button"
	tabindex="0"
	on:keydown={(e) => e.key === 'Enter' && onClick()}
>
	<div class="p-4">
		<!-- Header -->
		<div class="flex items-start justify-between gap-3">
			<div>
				<div class="text-xs font-medium uppercase tracking-wide opacity-50">
					Booking
				</div>

				<div class="mt-0.5 text-lg font-bold">#{index + 1}
				</div>
			</div>
			<div class='flex flex-row gap-2'>
				<span class="badge {getStatusBadgeClass(booking.details.status)}">
					{booking.details.status}
				</span>
				<span class="badge {getStatusBadgeClass(getTimeStatus(booking.details.startTime))}">
					{getTimeStatus(booking.details.startTime)}
				</span>
			</div>
		</div>

		<div class="my-4 h-px bg-base-300"></div>

		<!-- Main booking information -->
		<div class="space-y-3">
			
						<div>
							<div class="text-xs opacity-50">Date</div>
							<div class="font-medium">
								{formatBookingDate(booking.details.startTime)}
							</div>
						</div>
			<div>
				<div class="text-xs opacity-50">Unit</div>
				<div class="font-semibold">
					{booking.details.units.subUnits.map((subUnit) => subUnit.description).join(', ')}
				</div>
			</div>

			<div>
				<div class="text-xs opacity-50">Price</div>
				<div class="font-medium">
					Rs.{calculateTotalPrice(booking.details.units.subUnits, (new Date(booking.details.endTime).getTime() - new Date(booking.details.startTime).getTime()) / (1000 * 60 * 60))}
				</div>
			</div>

			<div class="flex gap-8">
				<div>
					<div class="text-xs opacity-50">Start</div>
					<div class="font-medium">
						{formatDate(booking.details.startTime)}
					</div>
				</div>

				<div>
					<div class="text-xs opacity-50">End</div>
					<div class="font-medium">
						{formatDate(booking.details.endTime)}
					</div>
				</div>
			</div>
		</div>
	</div>
</div>