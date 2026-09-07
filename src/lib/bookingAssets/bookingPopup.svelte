<script lang="ts">
	import BookIcon from '$lib/icons/BookIcon.svelte';
	import {
		HHMMToMinutes,
		minutesToHHMM,
		to12HourFormat,
		formatDate,
		parseTimeStringToUTCMinutes,
		combineUTCDateAndTime,
		timeStringToLocal
	} from '$lib/utils/timeUtils';
	import { bookingDayData } from './bookingStore';
	import { calculateTotalPrice, hasBookingConflict } from '$lib/bookingLogic';
	import { goto } from '$app/navigation';
	import { tick } from 'svelte';
	import {
		courtStatusEnum,
		QUERY_PARAM_BOOKING_DATE,
		QUERY_PARAM_BOOKING_SHOW_CONFIRMATION
	} from '$lib/constants/postgressFunctionConstants';
	import type {
		BookingDetails,
		courtsType,
		CourtWithClosures,
		SubUnit,
		VenueData,
		VenueSettings
	} from '../../types/bookingTypes';

	// Step numbers:
	// 1 is used by the calendar in +page.svelte;
	// this component continues the same visual flow from step 2 onward.
	const STEP_COURT = 2;
	const STEP_DURATION = 3;
	const STEP_TIME = 4;

	let {
		isLoggedIn = false,
		venueData,
		settingsData,
		courtsData,
		closureData,
		isVenueOwner = false,
		bookingState
	}: {
		isLoggedIn?: boolean;
		venueData: VenueData;
		settingsData: VenueSettings;
		courtsData: courtsType;
		closureData: CourtWithClosures[];
		isVenueOwner: boolean;
		bookingState?: {
			showConfirmation: boolean;
			selectedCourtId: number | null;
			selectedUnitId: number | null;
			selectedSubUnitIds: number[];
			selectedDuration: string;
			selectedTime: string;
		};
	} = $props();

	let selectedCourtId = $state(bookingState?.selectedCourtId ?? null);
	let selectedUnitId = $state(bookingState?.selectedUnitId ?? null);
	let selectedSubUnitIds = $state(bookingState?.selectedSubUnitIds ?? []);
	let selectedDuration = $state(bookingState?.selectedDuration ?? '01:00');
	let selectedTime = $state(bookingState?.selectedTime ?? '09:00');

	let showConfirmation = $state(bookingState?.showConfirmation ?? false);
	let pendingBooking: BookingDetails | null = $state(null);
	let isConfirming = $state(false);

	let bookingResult: 'success' | 'error' | null = $state(null);
	let bookingMessage = $state('');

	let rootEl: HTMLDivElement;

	let selectedCourt = $derived(
		courtsData.find((court) => court.courtID === selectedCourtId)
	);

	let selectedUnit = $derived(
		selectedCourt?.units?.find((unit) => unit.unitID === selectedUnitId)
	);

	let availableSubUnits = $derived(selectedUnit?.subUnits || []);

	let selectedSubUnits = $derived(
		availableSubUnits.filter((subUnit) =>
			selectedSubUnitIds.includes(subUnit.id)
		)
	);

	let allUnits = $derived(
		courtsData.flatMap(
			(court) =>
				(court.approvalStatus === courtStatusEnum.APPROVED &&
					court.units?.map((unit) => ({
						...unit,
						courtId: court.courtID,
						courtName: court.name,
						displayName: `${court.name} - ${unit.title}`
					}))) ||
				[]
		)
	);

	// Duration expressed in whole hours, driving the +/- stepper.
	let durationHours = $derived(
		Math.round(HHMMToMinutes(selectedDuration) / 60)
	);

	let maxDurationHours = $derived(
		Math.round((settingsData?.maxBookingDurationMinutes || 180) / 60)
	);

	// Single source of truth for time slots.
	// Every slot is independently checked for a conflict.
	let allTimeSlots = $derived.by(() => {
		if (!settingsData?.daySettings || !$bookingDayData?.date) return [];

		const dayName = $bookingDayData.date
			.toLocaleDateString('en-LK', {
				weekday: 'long'
			})
			.toLowerCase();

		const daySettings = settingsData.daySettings[dayName];

		if (
			!daySettings?.is_day_bookable ||
			!daySettings.openTime ||
			!daySettings.closeTime
		) {
			return [];
		}

		const openingTime = parseTimeStringToUTCMinutes(
			daySettings.openTime
		);

		const closingTime = parseTimeStringToUTCMinutes(
			daySettings.closeTime
		);

		const interval = settingsData.slotGenerationInterval || 60;
		const durationMinutes = HHMMToMinutes(selectedDuration);

		const slots: {
			time: string;
			available: boolean;
		}[] = [];

		for (
			let time = openingTime;
			time <= closingTime - durationMinutes;
			time += interval
		) {
			const conflict = hasBookingConflict(
				dayName,
				settingsData.daySettings,
				$bookingDayData.entries,
				{
					courtID: selectedCourtId!,
					startTime: combineUTCDateAndTime(
						$bookingDayData.date,
						minutesToHHMM(time)
					),
					endTime: combineUTCDateAndTime(
						$bookingDayData.date,
						minutesToHHMM(time + durationMinutes)
					),
					units: {
						unitID: selectedUnitId!,
						subUnits: selectedSubUnits
					}
				},
				closureData
			).conflicts;

			slots.push({
				time: minutesToHHMM(time),
				available: !conflict
			});
		}

		return slots;
	});

	let timeOptions = $derived(
		allTimeSlots
			.filter((slot) => slot.available)
			.map((slot) => slot.time)
	);

	let totalPrice = $derived(
		calculateTotalPrice(selectedSubUnits, durationHours)
	);

	/**
	 * Sends the booking to the API.
	 *
	 * The local booking state is only updated after the API
	 * confirms the booking was successful.
	 */
	async function attemptBooking(
		booking: BookingDetails
	): Promise<any> {
		try {
			const response = await fetch(
				`/api/v1/bookings/${venueData.venueID}`,
				{
					method: 'PUT',
					headers: {
						'Content-Type': 'application/json'
					},
					body: JSON.stringify(booking)
				}
			);

			const r = await response.json();

			// Only add the booking locally if the API request succeeded.
			if (response.ok) {
				$bookingDayData.entries = [
					...$bookingDayData.entries,
					booking
				];
			}

			return r;
		} catch (error) {
			console.log('Error: ', error);
			return null;
		}
	}

	/**
	 * Confirm the pending booking.
	 */
	async function confirmBooking(): Promise<void> {
		if (!pendingBooking) return;

		// If the user isn't logged in, send them through authentication
		// and preserve all booking information in the query parameters.
		if (!isLoggedIn) {
			const params = new URLSearchParams({
				[QUERY_PARAM_BOOKING_DATE]:
					$bookingDayData.date.toISOString().split('T')[0],

				[QUERY_PARAM_BOOKING_SHOW_CONFIRMATION]: 'true',

				court: String(selectedCourtId),
				unit: String(selectedUnitId),
				subunits: selectedSubUnitIds.join(','),
				duration: selectedDuration,
				time: selectedTime
			});

			const next = `/booking?${params.toString()}`;

			return goto(
				`/auth?next=${encodeURIComponent(next)}`
			);
		}

		isConfirming = true;

		const bookingPossible = await attemptBooking(
			pendingBooking
		);

		if (typeof bookingPossible === 'string') {
			// Booking succeeded.
			bookingResult = 'success';

			bookingMessage = isVenueOwner
				? 'Booking has been successfully added to the system.'
				: 'Your booking has been confirmed successfully!';

			// Hide the booking confirmation screen.
			showConfirmation = false;

			// Clear the pending booking.
			pendingBooking = null;
		} else {
			// Booking failed.
			bookingResult = 'error';

			bookingMessage =
				'Failed to confirm booking. ' +
				(bookingPossible?.error
					? bookingPossible.error
					: '');

			showConfirmation = false;
			pendingBooking = null;

			// Automatically remove the error after 5 seconds.
			setTimeout(() => {
				bookingResult = null;
			}, 5000);
		}

		isConfirming = false;
	}

	/**
	 * Creates the pending booking and opens the confirmation screen.
	 */
	async function handleBooking() {
		if (timeOptions.length === 0) return;

		pendingBooking = createPendingBooking();
		showConfirmation = true;
	}

	/**
	 * Cancel the confirmation flow.
	 */
	function cancelBooking(): void {
		showConfirmation = false;
		pendingBooking = null;
	}

	/**
	 * Reset the successful booking state and return to the
	 * booking form so the user can book another slot.
	 */
	function bookMoreSlots(): void {
		showConfirmation = false;
		pendingBooking = null;
		bookingResult = null;
		bookingMessage = '';
	}

	function selectUnit(unit: (typeof allUnits)[number]) {
		selectedCourtId = unit.courtId;
		selectedUnitId = unit.unitID;

		selectedSubUnitIds =
			unit.subUnits && unit.subUnits.length > 0
				? unit.subUnits.map(
						(su: SubUnit) => su.id
					)
				: [];
	}

	function handleSubUnitToggle(subUnitId: number) {
		const currentlySelected =
			selectedSubUnitIds.length;

		const isSelected =
			selectedSubUnitIds.includes(subUnitId);

		// Always keep at least one sub-unit selected.
		if (currentlySelected === 1 && isSelected) return;

		isSelected
			? (selectedSubUnitIds =
					selectedSubUnitIds.filter(
						(id) => id !== subUnitId
					))
			: (selectedSubUnitIds = [
					...selectedSubUnitIds,
					subUnitId
				]);
	}

	function setDurationHours(hours: number) {
		selectedDuration =
			String(hours).padStart(2, '0') + ':00';
	}

	function incrementDuration() {
		if (durationHours < maxDurationHours) {
			setDurationHours(durationHours + 1);
		}
	}

	function decrementDuration() {
		if (durationHours > 1) {
			setDurationHours(durationHours - 1);
		}
	}

	function createPendingBooking(): BookingDetails {
		return {
			courtStatus: selectedCourt?.approvalStatus!,
			courtID: selectedCourtId!,

			startTime: combineUTCDateAndTime(
				$bookingDayData.date,
				selectedTime
			),

			endTime: combineUTCDateAndTime(
				$bookingDayData.date,
				minutesToHHMM(
					HHMMToMinutes(selectedTime) +
						HHMMToMinutes(selectedDuration)
				)
			),

			status: 'pending',

			units: {
				title: selectedUnit?.title!,
				unitID: selectedUnit?.unitID!,
				subUnits: selectedSubUnits
			}
		};
	}

	/**
	 * Make sure selected time remains valid when the selected
	 * court, duration, date, etc. changes.
	 */
	$effect(() => {
		if (
			timeOptions.length > 0 &&
			!timeOptions.includes(selectedTime)
		) {
			selectedTime = timeOptions[0];
		}
	});

	/**
	 * Restore the confirmation state after authentication.
	 */
	$effect(() => {
		if (
			bookingState?.showConfirmation &&
			!pendingBooking &&
			selectedCourt &&
			selectedUnit
		) {
			pendingBooking = createPendingBooking();
		}
	});

	/**
	 * Automatically select the first available unit.
	 */
	$effect(() => {
		if (!selectedUnitId && allUnits.length > 0) {
			const firstUnit = allUnits[0];

			selectedCourtId = firstUnit.courtId;
			selectedUnitId = firstUnit.unitID;

			if (
				firstUnit.subUnits &&
				firstUnit.subUnits.length > 0
			) {
				selectedSubUnitIds =
					firstUnit.subUnits.map(
						(su) => su.id
					);
			}
		}
	});

	/**
	 * Clear result state when the booking date changes.
	 */
	$effect(() => {
		$bookingDayData.date;
		bookingResult = null;
	});

	/**
	 * Scroll the confirmation/result panel into view.
	 */
	let skipInitialScroll = true;

	$effect(() => {
		showConfirmation;
		bookingResult;

		if (skipInitialScroll) {
			skipInitialScroll = false;
			return;
		}

		tick().then(() => {
			rootEl?.scrollIntoView({
				behavior: 'smooth',
				block: 'start'
			});
		});
	});
</script>

<div bind:this={rootEl}>

	<!-- ========================================================= -->
	<!-- MAIN BOOKING FORM                                         -->
	<!-- ========================================================= -->

	{#if !showConfirmation && !bookingResult}
		<div class="space-y-6">

			<!-- Court selection -->
			<div class="relative pb-2 md:pl-11">

				<div
					class="absolute left-0 top-0 hidden h-8 w-8 items-center justify-center rounded-full border-2 border-primary bg-base-100 text-xs font-bold text-primary md:flex"
				>
					{STEP_COURT}
				</div>

				<div
					class="absolute left-4 top-8 hidden h-[calc(100%-1rem)] w-px bg-base-300 md:block"
					aria-hidden="true"
				></div>

				<h3 class="text-sm font-semibold text-base-content">
					Select court
				</h3>

				<p class="mb-3 text-xs text-base-content/50">
					Pick the court and setup that suits your game.
				</p>

				<div class="flex flex-wrap gap-2">
					{#each allUnits as unit}
						<button
							type="button"
							class="rounded-full border px-4 py-2 text-sm font-semibold transition-colors
								{unit.unitID === selectedUnitId
									? 'border-primary bg-primary text-primary-content'
									: 'border-base-300 bg-base-100 text-base-content hover:border-primary/50'}"
							on:click={() => selectUnit(unit)}
						>
							{unit.displayName}
						</button>
					{/each}
				</div>

				{#if availableSubUnits.length > 1}
					<div class="mt-3">
						<span class="mb-2 block text-xs text-base-content/60">
							Select one or more options
						</span>

						<div class="flex flex-wrap gap-2">
							{#each availableSubUnits as subUnit}
								<button
									type="button"
									class="rounded-full border px-3 py-1.5 text-xs font-semibold transition-colors
										{selectedSubUnitIds.includes(subUnit.id)
											? 'border-primary bg-primary text-primary-content'
											: 'border-base-300 bg-base-100 text-base-content hover:border-primary/50'}"
									on:click={() =>
										handleSubUnitToggle(subUnit.id)
									}
									aria-label={subUnit.description}
								>
									{subUnit.description}
								</button>
							{/each}
						</div>
					</div>
				{/if}
			</div>

			<!-- Facility requirements -->
			{#if (selectedCourt as any)?.facilityRequirements?.length}
				<div class="rounded-2xl border border-base-300 bg-base-100 p-4">
					<h3 class="mb-3 font-semibold text-base-content">
						Facility requirements
					</h3>

					<ul class="space-y-2 text-sm text-base-content/70">
						{#each (selectedCourt as any).facilityRequirements as requirement}
							<li class="flex items-start gap-2">
								<span
									class="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-primary"
								></span>

								{requirement}
							</li>
						{/each}
					</ul>
				</div>
			{/if}

			<!-- Duration -->
			<div class="relative pb-2 md:pl-11">

				<div
					class="absolute left-0 top-0 hidden h-8 w-8 items-center justify-center rounded-full border-2 border-primary bg-base-100 text-xs font-bold text-primary md:flex"
				>
					{STEP_DURATION}
				</div>

				<div
					class="absolute left-4 top-8 hidden h-[calc(100%-1rem)] w-px bg-base-300 md:block"
					aria-hidden="true"
				></div>

				<h3 class="text-sm font-semibold text-base-content">
					Select duration
				</h3>

				<p class="mb-3 text-xs text-base-content/50">
					How long would you like to play?
				</p>

				<div
					class="flex items-center justify-between rounded-2xl border border-base-300 bg-base-100 px-4 py-3"
				>
					<button
						type="button"
						class="btn btn-circle btn-ghost btn-sm border border-base-300"
						on:click={decrementDuration}
						disabled={durationHours <= 1}
						aria-label="Decrease duration"
					>
						−
					</button>

					<span class="text-lg font-bold text-base-content">
						{durationHours}
						{durationHours === 1 ? 'hr' : 'hrs'}
					</span>

					<button
						type="button"
						class="btn btn-circle btn-ghost btn-sm border border-base-300"
						on:click={incrementDuration}
						disabled={durationHours >= maxDurationHours}
						aria-label="Increase duration"
					>
						+
					</button>
				</div>
			</div>

			<!-- Time selection -->
			<div class="relative md:pl-11">

				<div
					class="absolute left-0 top-0 hidden h-8 w-8 items-center justify-center rounded-full border-2 border-primary bg-base-100 text-xs font-bold text-primary md:flex"
				>
					{STEP_TIME}
				</div>

				<h3 class="hidden text-sm font-semibold text-base-content md:flex">
					Select time
				</h3>

				<p class="mb-3 text-xs text-base-content/50">
					Green means available, red means already booked.
				</p>

				<div class="rounded-2xl border border-base-300 bg-base-100 p-3">

					{#if allTimeSlots.length === 0}

						<div class="flex items-center gap-3 px-1 py-3 text-error">
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
									d="M12 9v3.75m0 3.75h.008M12 21a9 9 0 100-18 9 9 0 000 18z"
								/>
							</svg>

							<div>
								<div class="font-semibold">
									Fully booked
								</div>

								<div class="text-xs">
									There are no available time slots for this day.
								</div>
							</div>
						</div>

					{:else}

						<div class="grid max-h-64 grid-cols-3 gap-2 overflow-y-auto pr-1 sm:grid-cols-4">

							{#each allTimeSlots as slot}
								<button
									type="button"
									class="rounded-lg px-2 py-2 text-xs font-semibold transition-colors sm:text-sm
										{selectedTime === slot.time && slot.available
											? 'bg-primary text-primary-content'
											: slot.available
												? 'border border-base-300 bg-base-100 text-base-content hover:border-primary/50'
												: 'cursor-not-allowed bg-error/10 text-error/50'}"
									disabled={!slot.available}
									on:click={() =>
										(selectedTime = slot.time)
									}
								>
									{to12HourFormat(
										timeStringToLocal(slot.time)
									)}
								</button>
							{/each}

						</div>

						<div
							class="mt-3 flex flex-wrap items-center justify-center gap-4 border-t border-base-300 pt-3 text-xs text-base-content/60"
						>
							<span class="flex items-center gap-1.5">
								<span class="h-2.5 w-2.5 rounded-full bg-error/20"></span>
								Unavailable
							</span>

							<span class="flex items-center gap-1.5">
								<span class="h-2.5 w-2.5 rounded-full border border-base-300"></span>
								Available
							</span>

							<span class="flex items-center gap-1.5">
								<span class="h-2.5 w-2.5 rounded-full bg-primary"></span>
								Selected
							</span>
						</div>

					{/if}

				</div>
			</div>

			<!-- Summary -->
			<div class="md:pl-11">

				<p class="mb-3 text-xs text-base-content/50">
					Almost there — review your booking below.
				</p>

				<div class="rounded-2xl border border-base-300 bg-base-100 p-4">

					{#if venueData?.venueBrand}

						<div class="mb-3 flex items-center gap-3 border-b border-base-300 pb-3">

							{#if (venueData as any)?.venueImage}
								<img
									src={(venueData as any).venueImage}
									alt={venueData.venueBrand}
									class="h-12 w-12 rounded-lg object-cover"
								/>
							{/if}

							<div>
								<div class="font-semibold text-base-content">
									{venueData.venueBrand}
								</div>

								{#if (venueData as any)?.address}
									<div class="text-xs text-base-content/60">
										{(venueData as any).address}
									</div>
								{/if}
							</div>

						</div>

					{/if}

					<div class="flex items-center justify-between">

						<div>
							<div class="font-semibold text-base-content">
								{selectedCourt?.name}
							</div>

							<div class="text-xs text-base-content/60">
								{selectedUnit?.title} ·
								{selectedSubUnits.length}
								unit{selectedSubUnits.length !== 1 ? 's' : ''}
								×
								{durationHours}
								{durationHours === 1 ? 'hr' : 'hrs'}
							</div>
						</div>

					</div>

					<div class="mt-3 flex items-center justify-between border-t border-base-300 pt-3">

						<span class="font-semibold text-base-content">
							Total
						</span>

						<span class="text-xl font-bold text-primary">
							{settingsData.currency} {totalPrice}
						</span>

					</div>

				</div>

				<!-- Book button -->
				<button
					on:click={handleBooking}
					class="btn btn-primary btn-block mt-4"
					disabled={timeOptions.length === 0}
				>
					<BookIcon />
					Book Now
				</button>

			</div>

		</div>
	{/if}


	<!-- ========================================================= -->
	<!-- BOOKING CONFIRMATION                                     -->
	<!-- ========================================================= -->

	{#if showConfirmation && pendingBooking}

		<div class="space-y-4">

			<div class="text-center">
				<h2 class="mb-1 text-xl font-bold text-base-content">
					Confirm your booking
				</h2>

				<p class="text-sm text-base-content/60">
					Please review your booking details below
				</p>
			</div>

			<div class="rounded-2xl border border-base-300 bg-base-100 p-4">

				<div class="mb-2 flex items-center justify-between">
					<span class="text-sm font-medium text-base-content/70">
						Date
					</span>

					<span class="text-sm font-semibold text-base-content">
						{formatDate(
							$bookingDayData.date
								.toLocaleDateString('en-CA')
								.split('T')[0]
						)}
					</span>
				</div>

				<div class="mb-2 flex items-center justify-between">
					<span class="text-sm font-medium text-base-content/70">
						Time
					</span>

					<span class="text-sm font-semibold text-base-content">
						{to12HourFormat(
							timeStringToLocal(selectedTime)
						)}
						-
						{to12HourFormat(
							timeStringToLocal(
								minutesToHHMM(
									HHMMToMinutes(selectedTime) +
										HHMMToMinutes(selectedDuration)
								)
							)
						)}
					</span>
				</div>

				<div class="mb-2 flex items-center justify-between">
					<span class="text-sm font-medium text-base-content/70">
						Duration
					</span>

					<span class="text-sm font-semibold text-base-content">
						{durationHours}
						{durationHours === 1 ? 'hour' : 'hours'}
					</span>
				</div>

				<div class="divider my-2"></div>

				<div class="mb-2 flex items-start justify-between">
					<span class="text-sm font-medium text-base-content/70">
						Court
					</span>

					<span class="text-sm font-semibold text-base-content">
						{selectedCourt?.name}
					</span>
				</div>

				<div class="mb-2 flex items-start justify-between">
					<span class="text-sm font-medium text-base-content/70">
						Unit
					</span>

					<span class="text-sm font-semibold text-base-content">
						{selectedUnit?.title}
					</span>
				</div>

				{#if selectedSubUnits.length > 0}

					<div class="flex items-start justify-between">
						<span class="text-sm font-medium text-base-content/70">
							Options
						</span>

						<div class="text-right text-sm font-semibold text-base-content">
							{#each selectedSubUnits as subUnit}
								<div>
									{subUnit.description}
								</div>
							{/each}
						</div>
					</div>

				{/if}

			</div>

			<!-- Total -->
			<div class="rounded-2xl border border-success/20 bg-success/10 p-4">

				<div class="flex items-center justify-between">

					<div>
						<h3 class="text-base font-semibold text-base-content">
							Total amount
						</h3>

						<p class="text-xs text-base-content/60">
							{selectedSubUnits.length}
							unit{selectedSubUnits.length !== 1 ? 's' : ''}
							×
							{durationHours}
							{durationHours === 1 ? 'hr' : 'hrs'}
						</p>
					</div>

					<div class="text-xl font-bold text-primary">
						{settingsData.currency} {totalPrice}
					</div>

				</div>

			</div>

			<!-- Pending status -->
			<div class="alert alert-warning rounded-2xl">

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
					<div class="font-medium">
						Booking status: Pending
					</div>

					<div>
						Your booking will be confirmed once processed.
					</div>
				</div>

			</div>

			<!-- Confirmation buttons -->
			<div class="flex gap-3">

				<button
					on:click={cancelBooking}
					class="btn btn-outline flex-1"
					disabled={isConfirming}
				>
					Cancel
				</button>

				<button
					on:click={confirmBooking}
					class="btn btn-primary flex-1"
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

	{/if}


	<!-- ========================================================= -->
	<!-- BOOKING RESULT                                           -->
	<!-- ========================================================= -->

	{#if bookingResult === 'success'}

		<!-- Success popup -->
		<div
			class="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4 backdrop-blur-sm"
		>

			<div
				class="w-full max-w-md rounded-3xl border border-base-300 bg-base-100 p-6 shadow-2xl"
			>

				<!-- Success icon -->
				<div class="text-center">

					<div
						class="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-success/15 text-success"
					>
						<svg
							xmlns="http://www.w3.org/2000/svg"
							fill="none"
							viewBox="0 0 24 24"
							class="h-9 w-9 stroke-current"
						>
							<path
								stroke-linecap="round"
								stroke-linejoin="round"
								stroke-width="2.5"
								d="M5 13l4 4L19 7"
							/>
						</svg>
					</div>

					<h2 class="text-2xl font-bold text-base-content">
						Booking Confirmed!
					</h2>

					<p class="mt-2 text-sm text-base-content/60">
						{bookingMessage}
					</p>

				</div>


				<!-- Booking summary -->
				<div class="mt-6 rounded-2xl bg-base-200 p-4">

					<div class="flex items-center justify-between">

						<div>

							<div class="text-sm font-semibold text-base-content">
								{selectedCourt?.name}
							</div>

							<div class="mt-1 text-xs text-base-content/60">
								{selectedUnit?.title}
							</div>

						</div>

						<div class="text-right">

							<div class="text-sm font-semibold text-base-content">
								{to12HourFormat(
									timeStringToLocal(selectedTime)
								)}
							</div>

							<div class="mt-1 text-xs text-base-content/60">
								{formatDate(
									$bookingDayData.date
										.toLocaleDateString('en-CA')
										.split('T')[0]
								)}
							</div>

						</div>

					</div>


					<div
						class="mt-3 flex items-center justify-between border-t border-base-300 pt-3"
					>

						<span class="text-sm text-base-content/60">
							Total
						</span>

						<span class="font-bold text-primary">
							{settingsData.currency} {totalPrice}
						</span>

					</div>

				</div>


				<!-- Actions -->
				<div class="mt-6 space-y-2">

					<button
						type="button"
						class="btn btn-primary btn-block"
						on:click={bookMoreSlots}
					>
						<BookIcon />
						Book More Slots
					</button>

					<button
						type="button"
						class="btn btn-outline btn-block"
						on:click={() => goto('/mybookings')}
					>
						View My Bookings
					</button>

				</div>

			</div>

		</div>

	{:else if bookingResult === 'error'}

		<!-- Error result -->
		<div class="rounded-2xl border border-base-300 bg-base-100 p-4">

			<div class="alert alert-error rounded-2xl">

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

					<h3 class="font-bold">
						Booking Failed
					</h3>

					<div class="text-xs">
						{bookingMessage}
					</div>

				</div>

			</div>

		</div>

	{/if}

</div>