<script lang="ts">
	import AddIcon from '$lib/icons/AddIcon.svelte';
	import CrossIcon from '$lib/icons/CrossIcon.svelte';
    // What is offlineID? well, the server has its own version of unique id's for each feature card. to avoid conflicting with the server's unique ID for each cards, we assign a unique ID on the client (owner).
	let newCardTitle = '';
	let newCardDescription = '';
	let showAddCardModal = false;
	export let whyChooseUsCards: {
		offlineID?: number;
		icon: string;
		title: string;
		description: string;
	}[] = [{ offlineID: 1, icon: '', title: 'Example title', description: 'description goes here' }];

	function assignUniqueIDs() {
		whyChooseUsCards.forEach((card, index) => {
			card.offlineID = index + 1;
		});
	}

	function removeCard(id: number) {
		whyChooseUsCards = whyChooseUsCards.filter((card) => card.offlineID !== id);
	}
	function openAddCardModal() {
		showAddCardModal = true;
		newCardTitle = '';
		newCardDescription = '';
	}

	function addNewCard() {
		if (newCardTitle.trim() && newCardDescription.trim()) {
			const newId = Math.max(...whyChooseUsCards.map((card) => card.offlineID!)) + 1;
			whyChooseUsCards = [
				...whyChooseUsCards,
				{
					offlineID: newId,
                    icon: '',
					title: newCardTitle.trim(),
					description: newCardDescription.trim()
				}
			];
			showAddCardModal = false;
		}
	}

	assignUniqueIDs();
</script>

<div class="card bg-base-100 shadow-xl">
	<div class="card-body p-4 sm:p-6">
		<div class="mb-4 sm:mb-6 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
			<h2 class="card-title text-xl sm:text-2xl">Features</h2>
			<button on:click={openAddCardModal} class="btn btn-primary btn-sm sm:btn-md">
				<AddIcon/>
				<span class="hidden xs:inline">Add Card</span>
				<span class="xs:hidden">Add</span>
			</button>
		</div>

		<div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3 sm:gap-4 lg:gap-6">
			{#each whyChooseUsCards as card}
				<div class="group card relative bg-base-200 shadow-md">
					<div class="card-body p-3 sm:p-4 lg:p-6">
						<button
							on:click={() => removeCard(card.offlineID)}
							class="btn absolute top-1 right-1 sm:top-2 sm:right-2 btn-circle btn-xs"
						>
							<CrossIcon />
						</button>
						<h3 class="card-title text-base sm:text-lg pr-6">{card.title}</h3>
						<p class="text-xs sm:text-sm leading-relaxed">{card.description}</p>
					</div>
				</div>
			{/each}
		</div>
	</div>
</div>

{#if showAddCardModal}
	<div class="modal-open modal">
		<div class="modal-box mx-2 sm:mx-0 max-w-sm sm:max-w-lg">
			<h3 class="mb-3 sm:mb-4 text-lg font-bold">Add New Card</h3>

			<div class="form-control mb-3 sm:mb-4 w-full">
				<label class="label py-1 sm:py-2">
					<span class="label-text text-sm">Card Title</span>
				</label>
				<input
					type="text"
					bind:value={newCardTitle}
					placeholder="Enter card title"
					class="input-bordered input input-sm sm:input-md w-full"
				/>
			</div>

			<div class="form-control mb-4 sm:mb-6 w-full">
				<label class="label py-1 sm:py-2">
					<span class="label-text text-sm">Card Description</span>
				</label>
				<textarea
					bind:value={newCardDescription}
					placeholder="Enter card description"
					class="textarea-bordered textarea textarea-sm sm:textarea-md h-20 sm:h-24 w-full text-sm"
				></textarea>
			</div>

			<div class="modal-action gap-2 mt-4">
				<button class="btn btn-sm sm:btn-md" on:click={() => (showAddCardModal = false)}>Cancel</button>
				<button class="btn btn-primary btn-sm sm:btn-md" on:click={addNewCard}>Add Card</button>
			</div>
		</div>
	</div>
{/if}