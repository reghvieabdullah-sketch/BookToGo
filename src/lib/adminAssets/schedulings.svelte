<script lang="ts">
	import { invalidate } from '$app/navigation';
	import { QUERY_PARAM_VENUE_CLOSURE_ID } from '$lib/constants/postgressFunctionConstants';
	import type { CourtWithClosures } from '../../types/bookingTypes';

	let { venueID, closureData }: { venueID: number; closureData: CourtWithClosures[] } = $props();

	// Form state
	let selectedCourtID = $state('');
	let reason = $state('');
	let duration = $state(1);
	let durationUnit = $state('Hours');
	let startDate = $state('');
	let startTime = $state('');
	let frequency = $state('Once');
	let submitted = $state(false);
	let isDeleting = $state(false);

	// Helper function to format date range based on start timestamp and duration
	function formatDateRange(startTimestamp: string, durationMinutes: number): string {
		const startDate = new Date(startTimestamp);
		const endDate = new Date(startDate.getTime() + durationMinutes * 60000);

		const options: Intl.DateTimeFormatOptions = {
			month: 'short',
			day: 'numeric',
			year: 'numeric'
		};

		const timeOptions: Intl.DateTimeFormatOptions = {
			hour: 'numeric',
			minute: '2-digit',
			hour12: true
		};

		const startDateStr = startDate.toLocaleDateString('en-LK', options);
		const startTimeStr = startDate.toLocaleTimeString('en-LK', timeOptions);

		const endDateStr = endDate.toLocaleDateString('en-LK', options);
		const endTimeStr = endDate.toLocaleTimeString('en-LK', timeOptions);

		// If same day, show: "Jan 1, 2025, 9:00 AM - 5:00 PM"
		if (startDateStr === endDateStr) {
			return `${startDateStr}, ${startTimeStr} - ${endTimeStr}`;
		}
		// If different days, show: "Jan 1, 2025, 9:00 AM - Jan 2, 2025, 5:00 PM"
		return `${startDateStr}, ${startTimeStr} - ${endDateStr}, ${endTimeStr}`;
	}

	// Helper function to get recurring type display text
	function getRecurringTypeText(recurringType: string | null): string {
		return recurringType || 'Once';
	}

	// Helper function to flatten closures
	function flattenClosures(courtsData: CourtWithClosures[]) {
		return courtsData.flatMap((court) =>
			court.closures.map((closure) => ({
				...closure,
				courtDescription: court.courtDescription || `Court ${court.courtID}`
			}))
		);
	}

	// Handle delete action
	async function handleDelete(closureID: number | undefined) {
		if (!closureID || isDeleting) return;

		isDeleting = true;
		try {
			const response = await fetch(
				`/api/v1/venues/${venueID}/closures/?${QUERY_PARAM_VENUE_CLOSURE_ID}=${closureID}`,
				{ method: 'DELETE' }
			);

			if (response.ok) {
				invalidate('layout:dashboard');
			} else {
				console.error('Failed to delete closure');
			}
		} catch (error) {
			console.error('Error deleting closure:', error);
		} finally {
			isDeleting = false;
		}
	}

	// Handle save action
	async function handleSave(e: SubmitEvent) {
		e.preventDefault();

		if (!selectedCourtID || !reason || !duration || !startDate || !startTime || !frequency) {
			submitted = true;
			return;
		}

		submitted = true;

		const closure: CourtWithClosures = {
			courtID: parseInt(selectedCourtID),
			courtDescription: '',
			closures: [
				{
					reason,
					startTimestamp: new Date(`${startDate}T${startTime}`).toISOString(),
					durationMinutes:
						durationUnit === 'Hours'
							? duration * 60
							: durationUnit === 'Days'
								? duration * 1440
								: duration * 10080, // Weeks
					recurringType: frequency
				}
			]
		};

		try {
			const response = await fetch(`/api/v1/venues/${venueID}/closures`, {
				method: 'PUT',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify([closure])
			});

			if (response.ok) {
				// Reset form
				invalidate('layout:dashboard');
				selectedCourtID = '';
				reason = '';
				duration = 1;
				durationUnit = 'Hours';
				startDate = '';
				startTime = '';
				frequency = 'Once';
			} else {
				console.error('Failed to save closure');
			}
		} catch (error) {
			console.error('Error saving closure:', error);
		} finally {
			submitted = false;
		}
	}
</script>

<div class="card mx-auto max-w-4xl bg-base-100 shadow-xl">
	<div class="card-body p-4 sm:p-6 lg:p-8">
		<h2 class="mb-4 card-title text-lg sm:text-xl">Schedule Task</h2>

		<form onsubmit={handleSave}>
			<div class="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
				<!-- Court Selection -->
				<div class="form-control md:col-span-2 lg:col-span-3">
					<label class="label">
						<span class="label-text text-base font-medium">Select Court</span>
					</label>
					<select class="select-bordered select w-full" bind:value={selectedCourtID} required>
						<option value="" disabled>Choose a court...</option>
						{#each closureData as court}
							<option value={court.courtID}>
								{court.courtDescription || `Court ${court.courtID}`} (ID: {court.courtID})
							</option>
						{/each}
					</select>
					{#if submitted && !selectedCourtID}
						<label class="label">
							<span class="label-text-alt text-error">This field is required</span>
						</label>
					{/if}
				</div>

				<!-- Reason Field -->
				<div class="form-control md:col-span-2 lg:col-span-3">
					<label class="label">
						<span class="label-text text-base font-medium">Reason</span>
					</label>
					<input
						type="text"
						placeholder="Enter reason for closure..."
						class="input-bordered input w-full"
						bind:value={reason}
						required
					/>
					{#if submitted && !reason}
						<label class="label">
							<span class="label-text-alt text-error">This field is required</span>
						</label>
					{/if}
				</div>

				<!-- Duration Section -->
				<div class="form-control">
					<label class="label">
						<span class="label-text text-base font-medium">Duration</span>
					</label>
					<div class="join w-full">
						<input
							type="number"
							min="1"
							max="60"
							bind:value={duration}
							class="input-bordered input join-item min-w-0 flex-1"
							required
						/>
						<select
							class="select-bordered select join-item min-w-0 flex-1"
							bind:value={durationUnit}
							required
						>
							<option>Hours</option>
						</select>
					</div>
					{#if submitted && !duration}
						<label class="label">
							<span class="label-text-alt text-error">This field is required</span>
						</label>
					{/if}
				</div>

				<!-- Date Section -->
				<div class="form-control">
					<label class="label">
						<span class="label-text text-base font-medium">Start Date</span>
					</label>
					<input type="date" class="input-bordered input w-full" bind:value={startDate} required />
					{#if submitted && !startDate}
						<label class="label">
							<span class="label-text-alt text-error">This field is required</span>
						</label>
					{/if}
				</div>

				<!-- Time Section -->
				<div class="form-control">
					<label class="label">
						<span class="label-text text-base font-medium">Start Time</span>
					</label>
					<input type="time" class="input-bordered input w-full" bind:value={startTime} required />
					{#if submitted && !startTime}
						<label class="label">
							<span class="label-text-alt text-error">This field is required</span>
						</label>
					{/if}
				</div>

				<!-- Frequency Section -->
				<div class="form-control md:col-span-2 lg:col-span-1">
					<label class="label">
						<span class="label-text text-base font-medium">Frequency</span>
					</label>
					<select class="select-bordered select w-full" bind:value={frequency} required>
						<option>Once</option>
						<option>Daily</option>
						<option>Weekly</option>
						<option>Monthly</option>
					</select>
					{#if submitted && !frequency}
						<label class="label">
							<span class="label-text-alt text-error">This field is required</span>
						</label>
					{/if}
				</div>

				<!-- Action Button -->
				<div class="form-control flex items-end justify-end md:col-span-2 lg:col-span-2">
					<button
						type="submit"
						class="btn w-full min-w-[140px] btn-primary sm:w-auto"
						disabled={submitted}
					>
						{#if submitted}
							<span class="loading loading-sm loading-spinner"></span>
						{:else}
							<svg
								xmlns="http://www.w3.org/2000/svg"
								class="h-5 w-5"
								fill="none"
								viewBox="0 0 24 24"
								stroke="currentColor"
							>
								<path
									stroke-linecap="round"
									stroke-linejoin="round"
									stroke-width="2"
									d="M5 13l4 4L19 7"
								/>
							</svg>
						{/if}
						Save Schedule
					</button>
				</div>
			</div>
		</form>
	</div>
</div>

<!-- Closures List Section -->
<div class="card mx-auto mt-6 max-w-4xl bg-base-100 shadow-xl">
	<div class="card-body p-4 sm:p-6 lg:p-8">
		<h2 class="mb-4 card-title text-lg sm:text-xl">Scheduled Closures</h2>

		{#if flattenClosures(closureData).length > 0}
			<div class="space-y-3">
				{#each flattenClosures(closureData) as closure (closure.closureID)}
					<div
						class="flex flex-row items-center gap-3 rounded-lg bg-base-200 p-3 transition-colors hover:bg-base-300"
					>
						<div class="min-w-0 flex-1">
							<div class="truncate text-sm font-semibold sm:text-base">
								{closure.courtDescription}{closure.reason ? ` - ${closure.reason}` : ''}
							</div>
							<div class="mt-1 text-xs text-base-content/70 sm:text-sm">
								<span class="inline-block"
									>{formatDateRange(closure.startTimestamp, closure.durationMinutes)}</span
								>
								<span class="mx-2 hidden sm:inline">•</span>
								<span class="inline-block">{getRecurringTypeText(closure.recurringType)}</span>
							</div>
						</div>
						<button
							class="btn flex-shrink-0 btn-sm btn-error"
							onclick={() => handleDelete(closure.closureID)}
							disabled={isDeleting}
						>
							{#if isDeleting}
								<span class="loading loading-xs loading-spinner"></span>
							{:else}
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
										d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
									/>
								</svg>
							{/if}
							<span class="ml-1 hidden sm:inline">Delete</span>
						</button>
					</div>
				{/each}
			</div>
		{:else}
			<!-- Empty State -->
			<div class="py-8 text-center text-base-content/60">
				<svg
					xmlns="http://www.w3.org/2000/svg"
					class="mx-auto mb-3 h-12 w-12 opacity-50"
					fill="none"
					viewBox="0 0 24 24"
					stroke="currentColor"
				>
					<path
						stroke-linecap="round"
						stroke-linejoin="round"
						stroke-width="2"
						d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
					/>
				</svg>
				<p class="text-sm">No scheduled closures yet</p>
			</div>
		{/if}
	</div>
</div>
