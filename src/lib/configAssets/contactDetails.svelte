<script lang="ts">
	import AddIcon from '$lib/icons/AddIcon.svelte';
	import CrossIcon from '$lib/icons/CrossIcon.svelte';
	import MaiIcon from '$lib/icons/maiIcon.svelte';
	import PhoneIcon from '$lib/icons/phoneIcon.svelte';
	import type { Component, ComponentType } from 'svelte';
	let showAddContactModal = false;
	export let contactDetails: {
		icon: string;
		title: string;
		description: string;
	}[] = [{ icon: '📞', title: 'Phone', description: '+94 77 123 4567' }];

	let newContactType = 'phone';
	let newContactDescription = '';
	const components: Record<string, Component> = {
		mail: MaiIcon,
		phone: PhoneIcon
	};
	function openAddContactModal() {
		showAddContactModal = true;
		newContactType = 'phone';
		newContactDescription = '';
	}

	export function getComponent(key: string): Component | null {
		return components[key] ?? null;
	}

	const contactTypes = [
		{ value: 'phone', label: 'Phone', icon: '📞' },
		{ value: 'email', label: 'Email', icon: '✉️' },
		{ value: 'whatsapp', label: 'WhatsApp', icon: '💬' }
	];

	function addNewContact() {
		if (newContactDescription.trim()) {
			const selectedType = contactTypes.find((type) => type.value === newContactType);
			if (selectedType) {
				contactDetails = [
					...contactDetails,
					{
						icon: selectedType.icon,
						title: selectedType.label,
						description: newContactDescription.trim()
					}
				];
				showAddContactModal = false;
			}
		}
	}

	function removeContact(index: number) {
		contactDetails = contactDetails.filter((_, i) => i !== index);
	}
</script>

<div class="card border border-base-200 bg-base-100 shadow-xl">
	<div class="card-body p-4 sm:p-6">
		<div class="mb-4 sm:mb-6 flex flex-col sm:flex-row sm:items-center justify-between gap-3 sm:gap-0">
			<h2 class="card-title text-lg sm:text-2xl">Contact Details</h2>
			<button on:click={openAddContactModal} class="btn gap-2 btn-primary btn-sm sm:btn-md">
				<AddIcon />
				<span class="hidden xs:inline">Add Contact</span>
				<span class="xs:hidden">Add</span>
			</button>
		</div>

		{#if contactDetails.length > 0}
			<div class="space-y-3 sm:space-y-4">
				{#each contactDetails as contact, index}
					{@const component = getComponent(contact.icon)}
					<div class="card border border-base-300 bg-base-200">
						<div class="card-body p-3 sm:p-4">
							<div class="flex items-center justify-between gap-2">
								<div class="flex items-center gap-3 sm:gap-4 min-w-0 flex-1">
									<span class="text-xl sm:text-3xl flex-shrink-0">
										{#if component}
											<svelte:component this={component} />
										{:else}
											{contact.icon}
										{/if}
									 </span>
									<div class="min-w-0 flex-1">
										<h4 class="text-xs sm:text-sm font-semibold text-primary">{contact.title}</h4>
										<p class="text-sm sm:text-lg text-base-content break-words">{contact.description}</p>
									</div>
								</div>
								<button
									on:click={() => removeContact(index)}
									class="btn btn-circle btn-ghost btn-xs flex-shrink-0"
								>
									<CrossIcon />
								</button>
							</div>
						</div>
					</div>
				{/each}
			</div>
		{:else}
			<p class="text-center text-sm sm:text-base text-base-content/70 italic">No contacts added yet.</p>
		{/if}
	</div>
</div>

{#if showAddContactModal}
	<div class="modal-open modal">
		<div class="modal-box w-11/12 max-w-md mx-4 sm:mx-auto">
			<h3 class="mb-4 text-base sm:text-lg font-bold text-primary">Add New Contact</h3>

			<div class="form-control mb-4 w-full">
				<label class="label">
					<span class="label-text text-sm sm:text-base">Contact Type</span>
				</label>
				<select bind:value={newContactType} class="select-bordered select w-full text-sm sm:text-base">
					{#each contactTypes as type}
						<option value={type.value}>{type.icon} {type.label}</option>
					{/each}
				</select>
			</div>

			<div class="form-control mb-6 w-full">
				<label class="label">
					<span class="label-text text-sm sm:text-base">
						{contactTypes.find((t) => t.value === newContactType)?.label} Details
					</span>
				</label>
				<input
					type="text"
					bind:value={newContactDescription}
					placeholder={newContactType === 'email'
						? 'Enter email address'
						: newContactType === 'whatsapp'
							? 'Enter WhatsApp number'
							: 'Enter phone number'}
					class="input-bordered input w-full text-sm sm:text-base"
				/>
			</div>

			<div class="modal-action flex-col-reverse sm:flex-row gap-2 sm:gap-0">
				<button class="btn btn-ghost btn-sm sm:btn-md w-full sm:w-auto" on:click={() => (showAddContactModal = false)}>
					Cancel
				</button>
				<button class="btn btn-primary btn-sm sm:btn-md w-full sm:w-auto" on:click={addNewContact}>Add Contact</button>
			</div>
		</div>
	</div>
{/if}