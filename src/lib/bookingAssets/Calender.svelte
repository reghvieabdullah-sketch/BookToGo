<script lang="ts">
	import { dayNamesShort, monthNames } from '$lib/constants/dayMonthconstants';
	import { bookingDayData, bookingPopupVisible, isLoading } from './bookingStore';
	import { HHMMToMinutes } from '$lib/utils/timeUtils';
	import {
		QUERY_PARAM_VENUE_BOOKING_DATE_END,
		QUERY_PARAM_VENUE_BOOKING_DATE_START
	} from '$lib/constants/postgressFunctionConstants';
	import { onMount } from 'svelte';

	let { bookingData, settingsData, venueData } = $props();
	// Use state instead of derived for month/year navigation
	let currentMonth = $state($bookingDayData.date?.getUTCMonth() ?? new Date().getUTCMonth());
	let currentYear = $state($bookingDayData.date?.getUTCFullYear() ?? new Date().getUTCFullYear());
	let calendarDays = $derived(generateCalendarDays(currentMonth, currentYear));

	// --- Helper: format date in YYYY-MM-DD (UTC) ---
	function formatDateUTC(date: Date) {
		return date.toISOString().split('T')[0];
	}

	function setDayBooking(date: Date) {
		const key = formatDateUTC(date);
		const entries = bookingData ? (bookingData[key] ?? []) : [];
		// console.log(bookingData);
		
		$bookingDayData = { date, entries };
		// isLoading.set(false);
	}

	function getIsBookableDay(date: Date) {
		const todayUTC = new Date();
		todayUTC.setUTCHours(0, 0, 0, 0); // start of UTC day

		const dayOfWeek = date.toLocaleString('en-US', { weekday: 'long', timeZone: 'UTC' });

		const isOpen = settingsData.daySettings?.[dayOfWeek.toLowerCase()]?.is_day_bookable ?? true;

		const isWithinAllowedRange = settingsData.maxBookingNoticeMinutes
			? date.getTime() < Date.now() + settingsData.maxBookingNoticeMinutes * 60 * 1000
			: true;

		const isOnOrAfterToday = date.getTime() >= todayUTC.getTime();

		return isOpen && isWithinAllowedRange && isOnOrAfterToday;
	}

	function findNextBookableDay(startDate: Date): Date | null {
		const maxDaysToCheck = 365;
		let checkDate = new Date(Date.UTC(startDate.getUTCFullYear(), startDate.getUTCMonth(), startDate.getUTCDate()));

		for (let i = 0; i < maxDaysToCheck; i++) {
			if (getIsBookableDay(checkDate)) return checkDate;
			checkDate.setUTCDate(checkDate.getUTCDate() + 1);
		}

		return null;
	}

	function generateCalendarDays(month: number, year: number) {
		const firstDayUTC = new Date(Date.UTC(year, month, 1));
		const daysInMonth = new Date(Date.UTC(year, month + 1, 0)).getUTCDate();
		const firstDayOfWeek = (firstDayUTC.getUTCDay() + 6) % 7; // Monday = 0
		const days = [];

		// Leading blanks
		for (let i = 0; i < firstDayOfWeek; i++) {
			days.push({ day: null, isBookableDay: false, date: null });
		}

		// Month days
		for (let day = 1; day <= daysInMonth; day++) {
			const dateUTC = new Date(Date.UTC(year, month, day));
			const todayUTC = new Date();
			todayUTC.setUTCHours(0, 0, 0, 0);

			days.push({
				day,
				isBookableDay: getIsBookableDay(dateUTC),
				date: dateUTC,
				isToday: formatDateUTC(dateUTC) === formatDateUTC(todayUTC)
			});
		}

		return days;
	}

	async function refetchBookingData() {

		const startDate = new Date(currentYear, currentMonth, 1);
		const endDate = new Date(currentYear, currentMonth + 1, 0, 23, 59, 59, 999);
		console.warn(`refetching from ${startDate.toISOString()} to ${endDate.toISOString()}`);
		
		const response = await fetch(
			`/api/v1/bookings/${venueData?.venueID}?${QUERY_PARAM_VENUE_BOOKING_DATE_START}=${startDate.toISOString()}&${QUERY_PARAM_VENUE_BOOKING_DATE_END}=${endDate.toISOString()}`
		);
		bookingData = await response.json();
		console.log(bookingData);
		
	}

	async function previousMonth() {
		const todayUTC = new Date();
		todayUTC.setUTCHours(0, 0, 0, 0);


		if (currentMonth === 0) {
			currentMonth = 11;
			currentYear--;
		} else {
			currentMonth--;
		}
		await refetchBookingData();
	}

	async function nextMonth() {
		if (currentMonth === 11) {
			currentMonth = 0;
			currentYear++;
		} else {
			currentMonth++;
		}
		await refetchBookingData();
	}

	function selectDate(day: any) {
		if (!day?.date || !day.isBookableDay) return;
		setDayBooking(day.date);
	}

	function bookedPercentageForDate(date: Date) {
		if (!date) return 0;
		
		const weekday = date.toLocaleString('en-US', { weekday: 'long', timeZone: 'UTC' }).toLowerCase();
		const daySettings = settingsData?.daySettings?.[weekday] ?? {};
		const slotGenerationValue = settingsData?.slotGenerationInterval ?? 60;
		// are fallbacks needed for slotgeneration, what if the owner does some shit yet doesnt want 60 min bookings
		const openTime = daySettings.openTime ?? '00:00';
		const closeTime = daySettings.closeTime ?? '23:59';

		const totalSlots = (HHMMToMinutes(closeTime) - HHMMToMinutes(openTime)) / slotGenerationValue;
		
		const bookedSlots = bookingData?.[formatDateUTC(date)]?.length ?? 0;
		
		if (totalSlots === 0) return 0;
		
		return (bookedSlots / totalSlots) * 100;
	}

	onMount(() => {
		const todayUTC = new Date();
		todayUTC.setUTCHours(0, 0, 0, 0);

		if (!getIsBookableDay(todayUTC)) {
			const nextBookable = findNextBookableDay(todayUTC);
			if (nextBookable) setDayBooking(nextBookable);
		}
	});
</script>

<div class="mx-auto w-full sm:w-[90%] lg:w-[60%]">
	<!-- Header -->
	<div class="mb-4 flex items-center justify-between rounded-lg bg-base-200 p-4">
		<h2 class="text-lg font-semibold text-base-content md:text-xl">
			{monthNames[currentMonth]}
			{currentYear}
		</h2>

		<div class="flex gap-2">
			<button
				class="btn btn-circle btn-sm btn-primary"
				on:click={previousMonth}
				aria-label="Previous month"
			>
				<svg class="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
					<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7"
					></path>
				</svg>
			</button>
			<button
				class="btn btn-circle btn-sm btn-primary"
				on:click={nextMonth}
				aria-label="Next month"
			>
				<svg class="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
					<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7"
					></path>
				</svg>
			</button>
		</div>
	</div>

	<!-- Calendar -->
	<div class="rounded-lg bg-base-100 p-4 shadow-lg">
		<div class="mb-2 grid grid-cols-7 gap-2">
			{#each dayNamesShort as d}
				<div class="py-3 text-center text-sm font-semibold text-base-content/70">{d}</div>
			{/each}
		</div>

		<div class="grid grid-cols-7 gap-2">
			{#each calendarDays as day}
				<button
					class="btn relative flex items-center justify-center overflow-hidden rounded-lg text-sm btn-ghost duration-150 hover:scale-105 sm:h-20 md:text-base {!day?.isBookableDay
						? 'text-base-content/30'
						: ''}"
					class:ring-2={day?.date &&
						$bookingDayData.date &&
						day.date.toDateString() === $bookingDayData.date.toDateString()}
					on:click={() => {
						selectDate(day);
						$bookingPopupVisible = !$bookingPopupVisible;
					}}
					disabled={!day?.day}
				>
					<span class="z-10">{day?.day || ''}</span>

					{#if day?.date}
					{@const bookedPercent = bookedPercentageForDate(day.date)}
						{#if bookedPercent > 0}
						<span
							class="pointer-events-none absolute bottom-0 left-0 z-0 w-full bg-primary/20"
							style="height: {bookedPercent}%;"
							aria-hidden="true"
						></span>
						{/if}
					{/if}

				</button>
			{/each}
		</div>
	</div>

	{#if $bookingDayData.date}
		<div class="mt-4 rounded-lg bg-base-200 p-3">
			<p class="text-sm text-base-content">
				Selected: <span class="font-semibold">{$bookingDayData.date.toDateString()}</span>
			</p>
		</div>
	{/if}
</div>