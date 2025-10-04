<script lang="ts">
	import type { courtsType } from '../../types/bookingTypes';

	export let courts: courtsType;
	let showAddUnitModal = false;
	let showAddSubUnitModal = false;
	let showAddCourtModal = false;
	let currentCourtId = 0;
	let currentUnitId = 0;
	let newUnitTitle = '';
	let newSubUnitDescription = '';
	let newSubUnitPrice = 0;
	let newCourtName = '';
	let isAddingWithUnit = false;

	function openAddCourtModal() {
		newCourtName = '';
		showAddCourtModal = true;
	}

	function addNewCourt() {
		if (!newCourtName.trim()) return;

		const newId = Math.max(...courts.map((c) => c.courtID)) + 1;
		courts = [
			...courts,
			{
				courtID: newId,
				name: newCourtName.trim(),
				units: [],
				approvalStatus: 'pending',
			}
		];
		showAddCourtModal = false;
	}

	function openAddUnitModal(courtId: number) {
		currentCourtId = courtId;
		newUnitTitle = '';
		newSubUnitDescription = '';
		newSubUnitPrice = 0;
		isAddingWithUnit = true;
		showAddUnitModal = true;
	}

	function openAddSubUnitModal(courtId: number, unitId: number) {
		currentCourtId = courtId;
		currentUnitId = unitId;
		newSubUnitDescription = '';
		newSubUnitPrice = 0;
		isAddingWithUnit = false;
		showAddSubUnitModal = true;
	}

	function addNewUnit() {
		if (!newUnitTitle.trim() || !newSubUnitDescription.trim()) return;

		const court = courts.find((c) => c.courtID === currentCourtId);
		if (!court) return;

		const newUnitId = Math.max(...court.units!.map((u) => u.unitID)) + 1;
		court.units!.push({
			unitID: newUnitId,
			title: newUnitTitle.trim(),
			subUnits: [{ id: 1, description: newSubUnitDescription.trim(), price: newSubUnitPrice }]
		});
		courts = [...courts];
		showAddUnitModal = false;
	}

	function addNewSubUnit() {
		if (!newSubUnitDescription.trim()) return;

		const court = courts.find((c) => c.courtID === currentCourtId);
		const unit = court?.units!.find((u) => u.unitID === currentUnitId);
		if (!unit) return;

		const newSubUnitId = Math.max(...unit.subUnits.map((s) => s.id)) + 1;
		unit.subUnits.push({
			id: newSubUnitId,
			description: newSubUnitDescription.trim(),
			price: newSubUnitPrice
		});
		courts = [...courts];
		showAddSubUnitModal = false;
	}

	function removeSubUnit(courtId: number, unitId: number, subUnitId: number) {
		const court = courts.find((c) => c.courtID === courtId);
		const unit = court?.units.find((u) => u.unitID === unitId);
		if (unit) {
			if (unit.subUnits.length > 1) {
				unit.subUnits = unit.subUnits.filter((s) => s.id !== subUnitId);
			} else if (unit.subUnits.length === 1 && unit.subUnits[0].id === subUnitId) {
				court.units = court.units.filter((u) => u.unitID !== unitId);
			}
			courts = [...courts];
		}
	}
</script>

<div class="card bg-base-100 md:shadow-xl">
	<div class="card-body p-0!">
		<h2 class="mx-auto card-title hidden text-2xl md:inline">Pricing</h2>
		<div class="card bg-base-100 md:shadow-xl">
			{#each courts as court}
				<div class="flex w-full flex-row-reverse">
					<div class="mx-auto badge w-fit badge-secondary">{court.approvalStatus}</div>
				</div>
				<div class="card-body bg-base-200 p-4 sm:m-4 sm:p-6">
					<h3 class="mb-3 text-lg font-semibold sm:mb-4 sm:text-xl">{court.name}</h3>

					<!-- Desktop Table View -->
					<div class="hidden overflow-x-auto md:block">
						<table class="table w-full">
							<thead>
								<tr>
									<th class="w-fit">Unit</th>
									<th class="w-max">Sub-units</th>
								</tr>
							</thead>
							<tbody>
								{#each court.units as unit}
									<tr class="border-b">
										<td class="py-4 align-top">
											<div class="font-medium">{unit.title}</div>
										</td>
										<td class="py-4">
											<div class="flex flex-wrap items-start gap-2">
												{#each unit.subUnits as subUnit}
													<div class="card w-fit bg-base-200 shadow-sm">
														<div class="card-body p-4">
															<div class="flex items-start justify-between">
																<div class="flex-1">
																	<h4 class="text-sm font-medium">{subUnit.description}</h4>
																	<p class="text-lg font-bold text-primary">
																		Rs. {subUnit.price}
																	</p>
																</div>
																<button
																	on:click={() => removeSubUnit(court.courtID, unit.unitID, subUnit.id)}
																	class="btn btn-circle self-start btn-ghost btn-xs"
																>
																	<svg
																		xmlns="http://www.w3.org/2000/svg"
																		class="h-3 w-3"
																		fill="none"
																		viewBox="0 0 24 24"
																		stroke="currentColor"
																	>
																		<path
																			stroke-linecap="round"
																			stroke-linejoin="round"
																			stroke-width="2"
																			d="M6 18L18 6M6 6l12 12"
																		/>
																	</svg>
																</button>
															</div>
														</div>
													</div>
												{/each}
												<button
													on:click={() => openAddSubUnitModal(court.courtID, unit.unitID)}
													class="btn ml-auto btn-circle btn-sm btn-primary"
												>
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
															d="M12 4v16m8-8H4"
														/>
													</svg>
												</button>
											</div>
										</td>
									</tr>
								{/each}
							</tbody>
						</table>
					</div>

					<!-- Mobile Card View -->
					<div class="space-y-4 md:hidden">
						{#each court.units! as unit}
							<div class="card bg-base-200">
								<div class="card-body p-3 sm:p-4">
									<div class="flex w-full flex-row items-center align-middle">
										<h4 class="grow text-base font-medium sm:text-lg">{unit.title}</h4>
										<button
											on:click={() => openAddSubUnitModal(court.courtID, unit.unitID)}
											class="btn m-1! mt-3 h-fit w-fit grow-0 border-2 p-1! btn-outline btn-sm btn-primary sm:w-auto"
										>
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
													d="M12 4v16m8-8H4"
												/>
											</svg>
										</button>
									</div>
									<div class="space-y-2">
										{#each unit.subUnits as subUnit}
											<div
												class="flex items-center justify-between rounded-lg bg-base-100 p-2 sm:p-3"
											>
												<div class="min-w-0 flex-1">
													<p class="truncate text-sm font-medium">{subUnit.description}</p>
													<p class="text-sm font-bold text-primary sm:text-base">
														Rs. {subUnit.price}
													</p>
												</div>
												<button
													on:click={() => removeSubUnit(court.courtID, unit.unitID, subUnit.id)}
													class="btn ml-2 btn-circle flex-shrink-0 btn-ghost btn-xs"
												>
													<svg
														xmlns="http://www.w3.org/2000/svg"
														class="h-3 w-3"
														fill="none"
														viewBox="0 0 24 24"
														stroke="currentColor"
													>
														<path
															stroke-linecap="round"
															stroke-linejoin="round"
															stroke-width="2"
															d="M6 18L18 6M6 6l12 12"
														/>
													</svg>
												</button>
											</div>
										{/each}
									</div>
								</div>
							</div>
						{/each}
					</div>

					<div class="mt-4 flex w-full justify-end">
						<button
							on:click={() => openAddUnitModal(court.courtID)}
							class="btn w-full border-2 text-xs uppercase btn-outline btn-primary sm:w-auto sm:text-sm"
						>
							<svg
								xmlns="http://www.w3.org/2000/svg"
								class="h-4 w-4 sm:h-5 sm:w-5"
								fill="none"
								viewBox="0 0 24 24"
								stroke="currentColor"
							>
								<path
									stroke-linecap="round"
									stroke-linejoin="round"
									stroke-width="2"
									d="M12 4v16m8-8H4"
								/>
							</svg>
							<span class="hidden sm:inline">Add divisable unit</span>
							<span class="sm:hidden">Add Unit</span>
						</button>
					</div>
				</div>
			{/each}
		</div>

		<button class="btn mt-10 w-full btn-primary" on:click={openAddCourtModal}>New Court</button>
	</div>
</div>

{#if showAddCourtModal}
	<div class="modal-open modal">
		<div class="modal-box mx-4 max-w-sm sm:max-w-lg">
			<h3 class="mb-4 text-lg font-bold">Add New Court</h3>
			<div class="form-control mb-4 w-full">
				<label class="label">
					<span class="label-text">Court Name</span>
				</label>
				<input
					type="text"
					bind:value={newCourtName}
					placeholder="Enter court name"
					class="input-bordered input w-full"
				/>
			</div>

			<div class="modal-action">
				<button class="btn btn-sm sm:btn-md" on:click={() => (showAddCourtModal = false)}
					>Cancel</button
				>
				<button class="btn btn-sm btn-primary sm:btn-md" on:click={addNewCourt}>Add Court</button>
			</div>
		</div>
	</div>
{/if}

{#if showAddUnitModal}
	<div class="modal-open modal">
		<div class="modal-box mx-4 max-w-sm sm:max-w-lg">
			<h3 class="mb-4 text-lg font-bold">Add New Unit</h3>
			<div class="form-control mb-4 w-full">
				<label class="label">
					<span class="label-text">Unit Title</span>
				</label>
				<input
					type="text"
					bind:value={newUnitTitle}
					placeholder="Enter unit title"
					class="input-bordered input w-full"
				/>
			</div>

			<div class="divider">First Sub-unit (Required)</div>

			<div class="form-control mb-4 w-full">
				<label class="label">
					<span class="label-text">Sub-unit Description</span>
				</label>
				<input
					type="text"
					bind:value={newSubUnitDescription}
					placeholder="Enter sub-unit description"
					class="input-bordered input w-full"
				/>
			</div>
			<div class="form-control mb-4 w-full">
				<label class="label">
					<span class="label-text">Price (Rs.)</span>
				</label>
				<input
					type="number"
					bind:value={newSubUnitPrice}
					placeholder="Enter price"
					class="input-bordered input w-full"
				/>
			</div>

			<div class="modal-action">
				<button class="btn btn-sm sm:btn-md" on:click={() => (showAddUnitModal = false)}
					>Cancel</button
				>
				<button class="btn btn-sm btn-primary sm:btn-md" on:click={addNewUnit}>Add Unit</button>
			</div>
		</div>
	</div>
{/if}

{#if showAddSubUnitModal}
	<div class="modal-open modal">
		<div class="modal-box mx-4 max-w-sm sm:max-w-lg">
			<h3 class="mb-4 text-lg font-bold">Add New Sub-unit</h3>
			<div class="form-control mb-4 w-full">
				<label class="label">
					<span class="label-text">Description</span>
				</label>
				<input
					type="text"
					bind:value={newSubUnitDescription}
					placeholder="Enter sub-unit description"
					class="input-bordered input w-full"
				/>
			</div>
			<div class="form-control mb-4 w-full">
				<label class="label">
					<span class="label-text">Price (Rs.)</span>
				</label>
				<input
					type="number"
					bind:value={newSubUnitPrice}
					placeholder="Enter price"
					class="input-bordered input w-full"
				/>
			</div>
			<div class="modal-action">
				<button class="btn btn-sm sm:btn-md" on:click={() => (showAddSubUnitModal = false)}
					>Cancel</button
				>
				<button class="btn btn-sm btn-primary sm:btn-md" on:click={addNewSubUnit}
					>Add Sub-unit</button
				>
			</div>
		</div>
	</div>
{/if}
