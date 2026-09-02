<script lang="ts">
	// TODO - create a home page.
	// TODO - add the payment creds detail info into the dashboard page
	import { dayNamesFull } from '$lib/constants/dayMonthconstants';
	import { timeStringToLocal } from '$lib/utils/timeUtils';
	import type { VenueSettings } from '../../types/bookingTypes';
	import LabelHelper from './LabelHelper.svelte';
	let { venueSettings = $bindable() }: { venueSettings: VenueSettings } = $props();
	let isDayBookable = $state(
		dayNamesFull.map((day) => venueSettings.daySettings![day.toLowerCase()].is_day_bookable)
	);
	function minutesToDays(minutes: number): number {
		return minutes / (60 * 24);
	}

	function daysToMinutes(days: number): number {
		return days * 24 * 60;
	}

	function timetoISO(time24: string): string {
    // Parse hours and minutes
    const [hoursStr, minutesStr] = time24.split(":");
    const hours = parseInt(hoursStr, 10);
    const minutes = parseInt(minutesStr, 10);

    if (
        isNaN(hours) || isNaN(minutes) ||
        hours < 0 || hours > 23 ||
        minutes < 0 || minutes > 59
    ) {
        throw new Error("Invalid HH:MM time string");
    }

    // Create a Date object for today with the given time
    const now = new Date();
    now.setHours(hours, minutes, 0, 0);

    // Get timezone offset in ±HH:MM format
    const offsetMinutes = now.getTimezoneOffset();
    const absOffset = Math.abs(offsetMinutes);
    const offsetHours = Math.floor(absOffset / 60).toString().padStart(2, '0');
    const offsetMins = (absOffset % 60).toString().padStart(2, '0');
    const sign = offsetMinutes <= 0 ? "+" : "-";

    // Return ISO-like time string with local timezone
	return `${hoursStr.padStart(2,'0')}:${minutesStr.padStart(2,'0')}:00${sign}${offsetHours}:${offsetMins}`;
	
}

// 

	function updateOpenTime(day: string, value: string) {
		if (venueSettings.daySettings?.[day]) {
			venueSettings.daySettings[day].openTime = timetoISO(value);
		}
	}

	function updateCloseTime(day: string, value: string) {
		if (venueSettings.daySettings?.[day]) {
			venueSettings.daySettings[day].closeTime = timetoISO(value);
		}
	}

	function updateDayBookable(day: string, checked: boolean) {
		if (venueSettings.daySettings?.[day]) {
			venueSettings.daySettings[day].is_day_bookable = checked;
		}
	}
	const toLocalTime = (timeString?: string | null): string => {
		if (!timeString) return "";

		// Convert +00 / -05 / +0530 → +00:00 / -05:00 / +05:30
		const normalized = timeString.replace(
			/([+-])(\d{2})(?::?(\d{2}))?$/,
			(_, sign, hours, minutes = "00") =>
				`${sign}${hours}:${minutes}`
		);

		const date = new Date(`1970-01-01T${normalized}`);

		if (Number.isNaN(date.getTime())) return "";

		return date.toLocaleTimeString([], {
			hour: "2-digit",
			minute: "2-digit",
			hour12: true,
		});
	};

</script>

<div class="card bg-base-100 shadow-xl">
	<div class="card-body p-3 sm:p-6 lg:p-8">
		<div class="mb-4">
			<label class="label pb-2">
				<span class="label-text text-base font-semibold sm:text-lg">Opening/Closing Times</span>
			</label>

			<div class="space-y-3 sm:space-y-4">
				{#each dayNamesFull as dayOfWeek, i}
					<div
						class="rounded-lg border border-dashed p-3 transition-opacity duration-200"
						class:opacity-50={!isDayBookable[i]}
					>
						<!-- Mobile Layout -->
						<div class="block sm:hidden">
							<div class="mb-3 flex items-center justify-between">
								<div class="flex items-center gap-3">
									<input
										type="checkbox"
										class="checkbox checkbox-primary"
										checked={isDayBookable[i]}
										on:change={(e) => {
											isDayBookable[i] = e.currentTarget.checked;
											updateDayBookable(dayOfWeek.toLowerCase(), e.currentTarget.checked);
										}}
									/>
									<span class="text-base font-medium">{dayOfWeek}</span>
								</div>
							</div>

							{#if isDayBookable[i]}
								<div class="grid grid-cols-2 gap-3">
									<div>
										<label class="label pb-1">
											<span class="label-text text-xs font-medium">Opens</span>
										</label>
										<input
											type="time"
											class="input-bordered input input-sm w-full text-center text-sm"
											on:change={(e) =>
												updateOpenTime(dayOfWeek.toLowerCase(), e.currentTarget.value)}
											value={toLocalTime(venueSettings.daySettings?.[dayOfWeek.toLowerCase()]?.openTime)}
										/>
									</div>
									<div>
										<label class="label pb-1">
											<span class="label-text text-xs font-medium">Closes</span>
										</label>
										<input
											type="time"
											class="input-bordered input input-sm w-full text-center text-sm"
											on:change={(e) =>
												updateCloseTime(dayOfWeek.toLowerCase(), e.currentTarget.value)}
											value={toLocalTime(venueSettings.daySettings?.[dayOfWeek.toLowerCase()]?.closeTime)}
										/>
									</div>
								</div>
							{/if}
						</div>

						<!-- Desktop Layout -->
						<div class="hidden sm:flex sm:items-center sm:gap-4 lg:gap-6">
							<div class="flex items-center gap-3">
								<input
									type="checkbox"
									class="checkbox checkbox-primary"
									checked={isDayBookable[i]}
									on:change={(e) => {
										isDayBookable[i] = e.currentTarget.checked;
										updateDayBookable(dayOfWeek.toLowerCase(), e.currentTarget.checked);
									}}
								/>
								<span class="w-20 text-base font-medium lg:w-24">{dayOfWeek}</span>
							</div>

							<div class="flex flex-1 gap-4">
								<div class="flex-1">
									<label class="label pb-1">
										<span class="label-text text-xs font-medium">Opens at</span>
									</label>
									<input
										type="time"
										class="input-bordered input input-sm w-full text-center"
										disabled={!isDayBookable[i]}
										on:change={(e) =>
											updateOpenTime(dayOfWeek.toLowerCase(), e.currentTarget.value)}
										value={venueSettings.daySettings?.[dayOfWeek.toLowerCase()]?.openTime?.slice(
											0,
											5
										)}
									/>
								</div>
								<div class="flex-1">
									<label class="label pb-1">
										<span class="label-text text-xs font-medium">Closes at</span>
									</label>
									<input
										type="time"
										class="input-bordered input input-sm w-full text-center"
										disabled={!isDayBookable[i]}
										on:change={(e) =>
											updateCloseTime(dayOfWeek.toLowerCase(), e.currentTarget.value)}
										value={venueSettings.daySettings?.[dayOfWeek.toLowerCase()]?.closeTime?.slice(
											0,
											5
										)}
									/>
								</div>
							</div>
						</div>
					</div>
				{/each}
			</div>
		</div>

		<div class="mt-6 rounded-lg bg-primary/10 p-4">
			<div class="text-center">
				<p class="text-sm font-medium text-primary sm:text-base">
					Open <span class="font-semibold italic">{isDayBookable.filter(Boolean).length} days</span>
					per week
				</p>
			</div>
		</div>
		<div class="divider mt-8 mb-6 divider-primary">
			<span class="text-sm font-medium">Booking Settings</span>
		</div>
		<div class="space-y-8">
			<!-- Booking Configuration Section -->
			<div class="card bg-base-100 shadow-sm">
				<div class="card-body p-6">
					<h3 class="mb-4 flex items-center gap-2 text-lg font-semibold text-base-content">
						<svg class="h-5 w-5 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
							<path
								stroke-linecap="round"
								stroke-linejoin="round"
								stroke-width="2"
								d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
							/>
						</svg>
						Booking Configuration
					</h3>

					<div class="grid grid-cols-1 gap-6 lg:grid-cols-2">
						<LabelHelper
							altLabel="Time between consecutive bookings"
							inputValue={venueSettings.bookingCoolDown}
							onValueChange={(val) => (venueSettings.bookingCoolDown = val)}
							mainTextBold="Booking Cool Down"
							mainTextNormal="minutes"
							placeholder="e.g., 15"
						/>

						<LabelHelper
							altLabel="How often bookable time slots are generated"
							inputValue={venueSettings.slotGenerationInterval}
							onValueChange={(val) => (venueSettings.slotGenerationInterval = val)}
							mainTextBold="Slot Generation Interval"
							mainTextNormal="minutes"
							placeholder="e.g., 30"
						/>

						<LabelHelper
							altLabel="Maximum duration for a single booking"
							inputValue={venueSettings.maxBookingDurationMinutes}
							onValueChange={(val) => (venueSettings.maxBookingDurationMinutes = val)}
							mainTextBold="Max Booking Duration"
							mainTextNormal="minutes"
							placeholder="e.g., 240"
						/>

						<LabelHelper
							altLabel="Maximum bookings allowed per person"
							inputValue={venueSettings.bookingPerPerson}
							onValueChange={(val) => (venueSettings.bookingPerPerson = val)}
							mainTextBold="Max Bookings Per Person"
							mainTextNormal="bookings"
							placeholder="e.g., 3"
						/>
					</div>
				</div>
			</div>

			<!-- Advance Notice Section -->
			<div class="card bg-base-100 shadow-sm">
				<div class="card-body p-6">
					<h3 class="mb-4 flex items-center gap-2 text-lg font-semibold text-base-content">
						<svg class="h-5 w-5 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
							<path
								stroke-linecap="round"
								stroke-linejoin="round"
								stroke-width="2"
								d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
							/>
						</svg>
						Advance Notice Requirements
					</h3>

					<div class="grid grid-cols-1 gap-6 lg:grid-cols-2">
						<LabelHelper
							altLabel="How far in advance bookings must be made"
							inputValue={venueSettings.minBookingNoticeMinutes}
							onValueChange={(val) => (venueSettings.minBookingNoticeMinutes = val)}
							mainTextBold="Minimum Booking Notice"
							mainTextNormal="minutes"
							placeholder="e.g., 180"
						/>

						<LabelHelper
							altLabel="How far in advance bookings can be made"
							inputValue={minutesToDays(venueSettings.maxBookingNoticeMinutes!)}
							onValueChange={(val) => (venueSettings.maxBookingNoticeMinutes = daysToMinutes(val))}
							mainTextBold="Maximum Booking Notice"
							mainTextNormal="days"
							placeholder="e.g., 86400"
						/>
					</div>
				</div>
			</div>

			<!-- Cancellation Policy Section -->
			<div class="card bg-base-100 shadow-sm">
				<div class="card-body p-6">
					<h3 class="mb-4 flex items-center gap-2 text-lg font-semibold text-base-content">
						<svg class="h-5 w-5 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
							<path
								stroke-linecap="round"
								stroke-linejoin="round"
								stroke-width="2"
								d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z"
							/>
						</svg>
						Cancellation Policy
					</h3>

					<div class="grid grid-cols-1 gap-6 lg:grid-cols-2">
						<LabelHelper
							altLabel="Latest time customers can cancel bookings"
							inputValue={venueSettings.maxCancellationNoticeMinutes}
							onValueChange={(val) => (venueSettings.maxCancellationNoticeMinutes = val)}
							mainTextBold="Cancellation Notice"
							mainTextNormal="minutes"
							placeholder="e.g., 60"
						/>
						<!-- Placeholder for potential future cancellation settings -->
						<div class="pointer-events-none opacity-50">
							<LabelHelper
								altLabel="Additional cancellation settings coming soon"
								inputValue=""
								mainTextBold="Future Setting"
								mainTextNormal="TBD"
								placeholder="Coming soon..."
							/>
						</div>
					</div>
				</div>
			</div>
		</div>

		<!-- Settings Summary -->
		<div class="mt-8 rounded-lg bg-base-200 p-4">
			<h4 class="mb-3 flex items-center gap-2 font-medium">
				<svg
					xmlns="http://www.w3.org/2000/svg"
					class="h-4 w-4"
					fill="none"
					viewBox="0 0 24 24"
					stroke="currentColor"
				>
					<path
						stroke-linecap="round"
						stroke-linejoin="round"
						stroke-width="2"
						d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
					/>
				</svg>
				Settings Summary
			</h4>
			<div class="grid grid-cols-1 gap-3 text-xs sm:grid-cols-2 lg:grid-cols-3">
				{#if venueSettings.slotGenerationInterval}
					<div class="flex justify-between">
						<span>Slots every:</span>
						<span class="font-medium">{venueSettings.slotGenerationInterval}min</span>
					</div>
				{/if}
				{#if venueSettings.maxBookingDurationMinutes}
					<div class="flex justify-between">
						<span>Max duration:</span>
						<span class="font-medium">{venueSettings.maxBookingDurationMinutes / 60}h</span>
					</div>
				{/if}
				{#if venueSettings.bookingPerPerson}
					<div class="flex justify-between">
						<span>Max per person:</span>
						<span class="font-medium">{venueSettings.bookingPerPerson}</span>
					</div>
				{/if}
				{#if venueSettings.minBookingNoticeMinutes}
					<div class="flex justify-between">
						<span>Min notice:</span>
						<span class="font-medium">{venueSettings.minBookingNoticeMinutes / 60}h</span>
					</div>
				{/if}
				{#if venueSettings.maxBookingNoticeMinutes}
					<div class="flex justify-between">
						<span>Max advance:</span>
						<span class="font-medium"
							>{Math.round(venueSettings.maxBookingNoticeMinutes / (60 * 24))}d</span
						>
					</div>
				{/if}
				{#if venueSettings.maxCancellationNoticeMinutes}
					<div class="flex justify-between">
						<span>Cancel until:</span>
						<span class="font-medium"
							>{venueSettings.maxCancellationNoticeMinutes / 60}h before</span
						>
					</div>
				{/if}
			</div>
		</div>
	</div>
</div>
