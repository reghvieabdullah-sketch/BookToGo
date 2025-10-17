<script lang="ts">
	import BookIcon from '$lib/icons/BookIcon.svelte';
	import { HHMMToMinutes, minutesToHHMM, to12HourFormat, formatDate } from '$lib/utils/timeUtils';
	import GrabHandleIcon from '$lib/icons/GrabHandleIcon.svelte';
	import { bookingDayData } from './bookingStore';
	import { hasBookingConflict } from '$lib/bookingLogic';
	import type {
		BookingDetails,
		courtsType,
		CourtWithClosures,
		SubUnit,
		Unit,
		VenueData,
		VenueSettings
	} from '../../types/bookingTypes';
	import { goto } from '$app/navigation';
	import {
		courtStatusEnum,
		QUERY_PARAM_BOOKING_DATE,

		QUERY_PARAM_BOOKING_INSERT_WITH_CHECK

	} from '$lib/constants/postgressFunctionConstants';

	export const onclose = () => {};

	// Booking states
	export let isLoggedIn = false; // TODO - change that to reflect from the store
	export let venueData: VenueData;
	export let settingsData: VenueSettings;
	export let courtsData: courtsType;
	export let closureData: CourtWithClosures[];
	let showConfirmation = false;
	let pendingBooking: BookingDetails | null;
	let isConfirming = false;
	let bookingResult: 'success' | 'error' | null = null;
	let bookingMessage = '';
	$: ($bookingDayData.date, (showConfirmation = false), (bookingResult = null));

	async function attemptBooking(booking: BookingDetails): Promise<any> {
		try {
			const response = await fetch(`/api/v1/bookings/${venueData.venueID}?${QUERY_PARAM_BOOKING_INSERT_WITH_CHECK}`, {
				method: 'PUT',
				headers: {
					'Content-Type': 'application/json'
				},
				body: JSON.stringify(booking)
			});
			$bookingDayData.entries = [...$bookingDayData.entries, { details: booking }]; // even if its a failure, we add it to the list for now. since the user would keep seeing the same booking otherwise.
			// if (!response.ok) return false;
			// Assume passed the insertion checks if we get a 200 response
			const r = await response.json();
			console.log(r, ' is the response');
			return r;
		} catch (error) {
			console.log('Error: ', error);
		}
	}

	function saveBooking(state: any) {
		console.log('saved state: ', state);

		localStorage.setItem('bookingState', JSON.stringify(state));
	}

	function loadBooking() {
		const raw = localStorage.getItem('bookingState');
		raw
			? console.log('Loaded booking state: ', JSON.parse(raw))
			: console.log('No saved booking state');
		return raw ? JSON.parse(raw) : null;
	}

	function clearBooking() {
		localStorage.removeItem('bookingState');
	}
	async function confirmBooking(): Promise<void> {
		if (!pendingBooking) return;
		// if (!isLoggedIn)
		// 	return goto(
		// 		`/auth?next=/booking?${QUERY_PARAM_BOOKING_DATE}=${$bookingDayData.date.toISOString().split('T')[0]}`
		// 	);
		isConfirming = true;
		const bookingPossible = await attemptBooking(pendingBooking);
		console.log(bookingPossible);

		if (typeof bookingPossible === 'boolean' && bookingPossible) {
			bookingResult = 'success';
			bookingMessage = 'Your booking has been confirmed successfully! Redirecting...';
			showConfirmation = false;
			pendingBooking = null;

			setTimeout(() => {
				// goto('/bookings');
			}, 2000);
		} else {
			bookingResult = 'error';
			bookingMessage =
				'Failed to confirm booking. ' +
				(bookingPossible && bookingPossible.error ? bookingPossible.error : '');
			showConfirmation = false;
			pendingBooking = null;

			setTimeout(() => {
				bookingResult = null;
			}, 5000);
		}
		isConfirming = false;
	}

	function cancelBooking(): void {
		showConfirmation = false;
		pendingBooking = null;
	}
	// loaded booking, maybe be empty
	const loadedBooking = loadBooking();
	if (loadedBooking) clearBooking(); // clear after loading, we dont want to save old stale data.

	// Reactive variables for user selections
	let selectedCourtId: number | null = loadedBooking?.selectedCourtId || null;
	let selectedUnitId: number | null = loadedBooking?.selectedUnitId || null;
	let selectedSubUnitIds: number[] = loadedBooking?.selectedSubUnitIds || [];
	let selectedDuration = loadedBooking?.selectedDuration || '01:00';
	let selectedTime = loadedBooking?.selectedTime || '09:00';

	let timeOptions: string | any[] = [];
	// Reactive computations
	$: selectedCourt = courtsData.find((court) => court.courtID === selectedCourtId);
	$: selectedUnit = selectedCourt?.units?.find((unit) => unit.unitID === selectedUnitId);
	$: availableSubUnits = selectedUnit?.subUnits || [];
	$: selectedSubUnits = availableSubUnits.filter((subUnit) =>
		selectedSubUnitIds.includes(subUnit.id)
	);

	// Get all available units across all courts for the dropdown
	$: allUnits = courtsData.flatMap(
		(court) =>
			(court.approvalStatus === courtStatusEnum.APPROVED &&
				court.units?.map((unit) => ({
					...unit,
					courtId: court.courtID,
					courtName: court.name,
					displayName: `${court.name} - ${unit.title}`
				}))) ||
			[]
	);

	function generateTimeOptions() {
		if (!settingsData?.daySettings || !$bookingDayData?.date) return [];
		const dayName = $bookingDayData.date
			.toLocaleDateString('en-LK', { weekday: 'long' })
			.toLowerCase();
		const daySettings = settingsData.daySettings[dayName];

		if (!daySettings?.is_day_bookable || !daySettings.openTime || !daySettings.closeTime) {
			return [];
		}

		const options: string[] = [];
		const openingTime = HHMMToMinutes(daySettings.openTime.slice(0, 5));
		const closingTime = HHMMToMinutes(daySettings.closeTime.slice(0, 5));
		const interval = settingsData.slotGenerationInterval || 60;
		const durationMinutes = HHMMToMinutes(selectedDuration);
		let time = openingTime;
		while (time <= closingTime - durationMinutes) {
			time += interval;
			if (
				!hasBookingConflict(
					$bookingDayData.date.toLocaleDateString('en-US', { weekday: 'long' }).toLowerCase(),
					settingsData.daySettings,
					selectedCourtId!,
					selectedSubUnitIds,
					time,
					time + durationMinutes,
					$bookingDayData.entries,
					$bookingDayData.date.toDateString(),
					closureData
				)
			) {
				options.push(minutesToHHMM(time));
			} else {
				console.log('Conflict at time: ', minutesToHHMM(time));
				// And add a cooldown
				if (settingsData.bookingCoolDown) time += settingsData.bookingCoolDown;
			}
		}
		timeOptions = options;
	}

	let totalPrice = 0;
	$: (selectedDuration,
		$bookingDayData,
		selectedSubUnits,
		generateTimeOptions(),
		calculateTotalPrice());
	$: if (timeOptions.length > 0 && !timeOptions.includes(selectedTime)) {
		selectedTime = timeOptions[0];
	}

	function handleUnitSelection(event: Event) {
		const target = event.target as HTMLSelectElement;
		const selectedUnitData = JSON.parse(target.value);

		selectedCourtId = selectedUnitData.courtId;
		selectedUnitId = selectedUnitData.unitID;

		selectedSubUnitIds = [];

		if (selectedUnitData.subUnits && selectedUnitData.subUnits.length > 0) {
			selectedSubUnitIds = selectedUnitData.subUnits.map((su: SubUnit) => su.id);
		}
	}

	function handleSubUnitToggle(subUnitId: number) {
		const currentlySelected = selectedSubUnitIds.length;
		const isSelected = selectedSubUnitIds.includes(subUnitId);

		if (currentlySelected === 1 && isSelected) return;

		if (isSelected) {
			selectedSubUnitIds = selectedSubUnitIds.filter((id) => id !== subUnitId);
		} else {
			selectedSubUnitIds = [...selectedSubUnitIds, subUnitId];
		}
	}

	function calculateTotalPrice() {
		const durationHours = Math.round(HHMMToMinutes(selectedDuration) / 60);
		totalPrice = selectedSubUnits.reduce((sum, subUnit) => sum + subUnit.price, 0) * durationHours;
	}

	function localTimeToUTC(date: Date, timeStr: string): string {
		const [hours, minutes] = timeStr.split(':').map(Number);
		const localDate = new Date(date);
		localDate.setHours(hours, minutes, 0, 0);
		return localDate.toISOString();
	}

	function getUnitsForBooking(): Unit[] {
		return [
			{ title: selectedUnit?.title!, unitID: selectedUnit?.unitID!, subUnits: selectedSubUnits }
		];
	}
	// TODO - add a price check at the server.
	async function handleBooking() {
		const booking = {
			courtStatus: selectedCourt?.approvalStatus!,
			courtID: selectedCourtId!,
			startTime: localTimeToUTC($bookingDayData.date, selectedTime),
			endTime: localTimeToUTC(
				$bookingDayData.date,
				minutesToHHMM(HHMMToMinutes(selectedTime) + HHMMToMinutes(selectedDuration))
			),
			status: 'pending',
			units: getUnitsForBooking()
		};
		saveBooking({
			selectedCourtId,
			selectedUnitId,
			selectedSubUnitIds,
			selectedDuration,
			selectedTime
		});
		showConfirmation = true;
		pendingBooking = booking;
	}

	$: if (!selectedUnitId && allUnits.length > 0) {
		const firstUnit = allUnits[0];
		selectedCourtId = firstUnit.courtId;
		selectedUnitId = firstUnit.unitID;
		if (firstUnit.subUnits && firstUnit.subUnits.length > 0) {
			selectedSubUnitIds = firstUnit.subUnits.map((su) => su.id);
		}
	}
</script>

<!-- Main Booking Form -->
{#if !showConfirmation}
	<div class="max-w-sm border border-base-300 bg-base-100 p-3">
		<div class="mb-2 border border-base-300 bg-base-100 p-3">
			<div class="flex justify-center pb-1"><GrabHandleIcon /></div>
			<div class="mb-3 bg-primary/20 text-center">
				<div class="py-1 text-lg font-bold">
					{formatDate($bookingDayData.date.toLocaleDateString('en-CA').split('T')[0])}
				</div>
				<div class="px-3 py-1 text-base">
					{to12HourFormat(selectedTime)} - {to12HourFormat(
						minutesToHHMM(HHMMToMinutes(selectedTime) + HHMMToMinutes(selectedDuration))
					)}
				</div>
			</div>
			<div class="form-control">
				<label class="label" for="court-select">
					<span class="label-text text-sm">Court Type</span>
				</label>
				<select
					id="court-select"
					on:change={handleUnitSelection}
					class="select-bordered select select-sm"
				>
					{#each allUnits as unit}
						<option value={JSON.stringify(unit)} selected={unit.unitID === selectedUnitId}>
							{unit.displayName}
						</option>
					{/each}
				</select>

				{#if availableSubUnits.length > 1}
					<div class="mt-2">
						<label class="label">
							<span class="label-text text-xs">Select one or more options</span>
						</label>
						<form>
							{#each availableSubUnits as subUnit}
								<button
									type="button"
									class="btn mr-1 mb-1 btn-xs {selectedSubUnitIds.includes(subUnit.id)
										? 'btn-primary'
										: 'btn-ghost'}"
									on:click={() => handleSubUnitToggle(subUnit.id)}
									aria-label={subUnit.description}
								>
									{subUnit.description}
								</button>
							{/each}
						</form>
					</div>
				{/if}
			</div>
		</div>

		<!-- Duration and Time Selection -->
		<div class="mb-2 flex justify-around border border-base-300 bg-base-100 px-3 py-2">
			<div class="form-control">
				<label class="label" for="time-select">
					<span class="label-text text-xs">Start Time</span>
				</label>
				<select id="time-select" bind:value={selectedTime} class="select-bordered select select-sm">
					{#each timeOptions as timeOption}
						<option value={timeOption}>{to12HourFormat(timeOption)}</option>
					{/each}
				</select>
			</div>

			<div class="form-control">
				<label class="label" for="duration-select">
					<span class="label-text text-xs">Duration</span>
				</label>
				<select
					id="duration-select"
					bind:value={selectedDuration}
					class="select-bordered select select-sm"
				>
					{#each Array(Math.round((settingsData?.maxBookingDurationMinutes || 180) / 60)) as _, i}
						<option value={String(i + 1).padStart(2, '0') + ':00'}>
							{i + 1}
							{i + 1 === 1 ? 'hr' : 'hrs'}
						</option>
					{/each}
				</select>
			</div>
		</div>

		<!-- Price Summary Card -->
		<div class="mb-2 border border-primary/20 bg-primary/10 p-3">
			<div class="flex items-center justify-between">
				<div>
					<h3 class="text-base font-semibold">Total Price</h3>
					<p class="text-xs">
						{selectedSubUnits.length} unit{selectedSubUnits.length !== 1 ? 's' : ''} × {Math.round(
							HHMMToMinutes(selectedDuration) / 60
						)} hr{Math.round(HHMMToMinutes(selectedDuration) / 60) !== 1 ? 's' : ''}
					</p>
				</div>
				<div class="text-xl font-bold text-primary">
					LKR {totalPrice}
				</div>
			</div>
		</div>

		<!-- Book Button -->
		<div class="flex justify-center">
			<button on:click={handleBooking} class="btn btn-md btn-primary">
				<BookIcon />
				Book
			</button>
		</div>
	</div>
{/if}

<!-- Confirmation Screen -->
{#if showConfirmation && pendingBooking}
	<div class="max-w-sm border border-base-300 bg-base-100 p-4">
		<!-- Header -->
		<div class="mb-3 text-center">
			<div class="flex justify-center pb-2"><GrabHandleIcon /></div>
			<h2 class="mb-1 text-xl font-bold">Confirm Your Booking</h2>
			<p class="text-sm">Please review your booking details below</p>
		</div>

		<!-- Booking Details Card -->
		<div class="mb-3 border border-base-300 bg-base-200/50 p-4">
			<div class="mb-2 flex items-center justify-between">
				<span class="text-sm font-medium">Date</span>
				<span class="text-sm font-semibold">
					{formatDate($bookingDayData.date.toLocaleDateString('en-CA').split('T')[0])}
				</span>
			</div>

			<div class="mb-2 flex items-center justify-between">
				<span class="text-sm font-medium">Time</span>
				<span class="text-sm font-semibold">
					{to12HourFormat(selectedTime)} - {to12HourFormat(
						minutesToHHMM(HHMMToMinutes(selectedTime) + HHMMToMinutes(selectedDuration))
					)}
				</span>
			</div>

			<div class="mb-2 flex items-center justify-between">
				<span class="text-sm font-medium">Duration</span>
				<span class="text-sm font-semibold">
					{Math.round(HHMMToMinutes(selectedDuration) / 60)} hour{Math.round(
						HHMMToMinutes(selectedDuration) / 60
					) !== 1
						? 's'
						: ''}
				</span>
			</div>

			<div class="divider my-2"></div>

			<div class="mb-2 flex items-start justify-between">
				<span class="text-sm font-medium">Court</span>
				<span class="text-sm font-semibold">
					{selectedCourt?.name}
				</span>
			</div>

			<div class="mb-2 flex items-start justify-between">
				<span class="text-sm font-medium">Unit</span>
				<span class="text-sm font-semibold">
					{selectedUnit?.title}
				</span>
			</div>

			{#if selectedSubUnits.length > 0}
				<div class="flex items-start justify-between">
					<span class="text-sm font-medium">Options</span>
					<div class="text-right text-sm font-semibold">
						{#each selectedSubUnits as subUnit}
							<div>{subUnit.description}</div>
						{/each}
					</div>
				</div>
			{/if}
		</div>

		<!-- Price Summary -->
		<div class="mb-3 border border-success/20 bg-success/10 p-4">
			<div class="flex items-center justify-between">
				<div>
					<h3 class="text-base font-semibold">Total Amount</h3>
					<p class="text-xs">
						{selectedSubUnits.length} unit{selectedSubUnits.length !== 1 ? 's' : ''} × {Math.round(
							HHMMToMinutes(selectedDuration) / 60
						)} hr{Math.round(HHMMToMinutes(selectedDuration) / 60) !== 1 ? 's' : ''}
					</p>
				</div>
				<div class="text-xl font-bold text-success">
					LKR {totalPrice}
				</div>
			</div>
		</div>

		<!-- Status Notice -->
		<div class="mb-3 alert alert-warning">
			<svg
				xmlns="http://www.w3.org/2000/svg"
				fill="none"
				viewBox="0 0 24 24"
				class="h-6 w-6 shrink-0 stroke-current"
			>
				<path
					stroke-linecap="round"
					stroke-linejoin="round"
					stroke-width="2"
					d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
				></path>
			</svg>
			<div class="text-xs">
				<div class="font-medium">Booking Status: Pending</div>
				<div>Your booking will be confirmed once processed.</div>
			</div>
		</div>

		<!-- Action Buttons -->
		<div class="flex gap-3">
			<button
				on:click={cancelBooking}
				class="btn flex-1 btn-outline btn-md"
				disabled={isConfirming}
			>
				Cancel
			</button>
			<button
				on:click={confirmBooking}
				class="btn flex-1 btn-md btn-primary"
				disabled={isConfirming}
			>
				{#if isConfirming}
					<span class="loading loading-sm loading-spinner"></span>
					Confirming...
				{:else}
					Confirm Booking
				{/if}
			</button>
		</div>
	</div>
{:else if bookingResult}
	<div class="max-w-sm border border-base-300 bg-base-100 p-4">
		{#if bookingResult === 'success'}
			<div class="alert alert-success">
				<svg
					xmlns="http://www.w3.org/2000/svg"
					class="h-6 w-6 shrink-0 stroke-current"
					fill="none"
					viewBox="0 0 24 24"
				>
					<path
						stroke-linecap="round"
						stroke-linejoin="round"
						stroke-width="2"
						d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
					/>
				</svg>
				<div>
					<h3 class="font-bold">Success!</h3>
					<div class="text-xs">{bookingMessage}</div>
				</div>
			</div>
		{:else if bookingResult === 'error'}
			<div class="alert alert-error">
				<svg
					xmlns="http://www.w3.org/2000/svg"
					class="h-6 w-6 shrink-0 stroke-current"
					fill="none"
					viewBox="0 0 24 24"
				>
					<path
						stroke-linecap="round"
						stroke-linejoin="round"
						stroke-width="2"
						d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z"
					/>
				</svg>
				<div>
					<h3 class="font-bold">Error!</h3>
					<div class="text-xs">{bookingMessage}</div>
				</div>
			</div>
		{/if}
	</div>
{/if}
