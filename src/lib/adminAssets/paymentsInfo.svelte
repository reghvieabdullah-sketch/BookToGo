<script>
	import { onMount } from 'svelte';

	let merchantId = '';
	let merchantSecret = '';
	let businessEmail = '';
	let businessName = '';
	let allowCashPayments = false;
	let maxPaymentAmount = '';
	let isSaving = false;
	let saveSuccess = false;
	let errorMessage = '';

	// Load saved settings on mount
	onMount(() => {
		loadSettings();
	});

	function loadSettings() {
		// In a real app, this would fetch from your backend
		const saved = {
			merchantId: '',
			merchantSecret: '',
			businessEmail: '',
			businessName: '',
			allowCashPayments: false,
			maxPaymentAmount: ''
		};
		
		merchantId = saved.merchantId;
		merchantSecret = saved.merchantSecret;
		businessEmail = saved.businessEmail;
		businessName = saved.businessName;
		allowCashPayments = saved.allowCashPayments;
		maxPaymentAmount = saved.maxPaymentAmount;
	}

	async function handleSubmit() {
		errorMessage = '';
		saveSuccess = false;

		// Validation
		if (!merchantId.trim()) {
			errorMessage = 'Merchant ID is required';
			return;
		}

		if (!merchantSecret.trim()) {
			errorMessage = 'Merchant Secret is required';
			return;
		}

		if (!businessEmail.trim()) {
			errorMessage = 'Business Email is required';
			return;
		}

		if (maxPaymentAmount && (isNaN(maxPaymentAmount) || parseFloat(maxPaymentAmount) <= 0)) {
			errorMessage = 'Maximum payment amount must be a positive number';
			return;
		}

		isSaving = true;

		try {
			// In a real app, this would be an API call to your backend
			// await fetch('/api/payment-settings', {
			//   method: 'POST',
			//   headers: { 'Content-Type': 'application/json' },
			//   body: JSON.stringify({
			//     merchantId,
			//     merchantSecret,
			//     businessEmail,
			//     businessName,
			//     allowCashPayments,
			//     maxPaymentAmount: maxPaymentAmount ? parseFloat(maxPaymentAmount) : null
			//   })
			// });

			// Simulate API call
			await new Promise(resolve => setTimeout(resolve, 1000));
			
			saveSuccess = true;
			setTimeout(() => { saveSuccess = false; }, 3000);
		} catch (error) {
			errorMessage = 'Failed to save settings. Please try again.';
		} finally {
			isSaving = false;
		}
	}

	function formatAmount(value) {
		if (!value) return '';
		const num = parseFloat(value);
		return isNaN(num) ? value : num.toLocaleString();
	}
</script>

<div class="card bg-base-100 shadow-xl">
	<div class="card-body p-3 sm:p-6 lg:p-8">
		<h2 class="card-title text-2xl mb-2">Payment Settings</h2>
		<p class="text-sm text-base-content/70 mb-6">
			Configure how you receive payments from your booking customers
		</p>

		<form on:submit|preventDefault={handleSubmit} class="space-y-6">
			<!-- PayHere Integration Section -->
			<div class="border border-base-300 rounded-lg p-4 sm:p-6">
				<div class="flex items-center gap-2 mb-4">
					<svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor">
						<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
					</svg>
					<h3 class="text-xl font-semibold">PayHere Integration</h3>
				</div>

				<div class="space-y-4">
					<div class="form-control">
						<label class="label" for="merchantId">
							<span class="label-text font-medium">Merchant ID *</span>
						</label>
						<input
							id="merchantId"
							type="text"
							bind:value={merchantId}
							placeholder="Enter your PayHere Merchant ID"
							class="input input-bordered w-full"
							required
						/>
						<label class="label">
							<span class="label-text-alt text-base-content/60">
								Find this in your PayHere merchant dashboard
							</span>
						</label>
					</div>

					<div class="form-control">
						<label class="label" for="merchantSecret">
							<span class="label-text font-medium">Merchant Secret *</span>
						</label>
						<input
							id="merchantSecret"
							type="password"
							bind:value={merchantSecret}
							placeholder="Enter your PayHere Merchant Secret"
							class="input input-bordered w-full"
							required
						/>
						<label class="label">
							<span class="label-text-alt text-base-content/60">
								Keep this secret secure and never share it
							</span>
						</label>
					</div>

					<div class="form-control">
						<label class="label" for="businessEmail">
							<span class="label-text font-medium">Business Email *</span>
						</label>
						<input
							id="businessEmail"
							type="email"
							bind:value={businessEmail}
							placeholder="business@example.com"
							class="input input-bordered w-full"
							required
						/>
						<label class="label">
							<span class="label-text-alt text-base-content/60">
								Email associated with your PayHere account
							</span>
						</label>
					</div>

					<div class="form-control">
						<label class="label" for="businessName">
							<span class="label-text font-medium">Business Name</span>
						</label>
						<input
							id="businessName"
							type="text"
							bind:value={businessName}
							placeholder="Your Business Name"
							class="input input-bordered w-full"
						/>
						<label class="label">
							<span class="label-text-alt text-base-content/60">
								This will appear on payment receipts
							</span>
						</label>
					</div>
				</div>
			</div>

			<!-- Payment Options Section -->
			<div class="border border-base-300 rounded-lg p-4 sm:p-6">
				<h3 class="text-xl font-semibold mb-4">Payment Options</h3>

				<div class="space-y-4">
					<div class="form-control">
						<label class="label cursor-pointer justify-start gap-3">
							<input
								type="checkbox"
								bind:checked={allowCashPayments}
								class="checkbox checkbox-primary"
							/>
							<div>
								<span class="label-text font-medium">Allow Cash Payments</span>
								<p class="text-sm text-base-content/60 mt-1">
									Customers can choose to pay in cash when they arrive at your venue
								</p>
							</div>
						</label>
					</div>

					<div class="form-control">
						<label class="label" for="maxPayment">
							<span class="label-text font-medium">Maximum Payment Amount (LKR)</span>
						</label>
						<input
							id="maxPayment"
							type="number"
							bind:value={maxPaymentAmount}
							placeholder="e.g., 100000"
							min="0"
							step="0.01"
							class="input input-bordered w-full"
						/>
						<label class="label">
							<span class="label-text-alt text-base-content/60">
								{#if maxPaymentAmount && !isNaN(maxPaymentAmount) && parseFloat(maxPaymentAmount) > 0}
									Maximum: LKR {formatAmount(maxPaymentAmount)}
								{:else}
									Leave empty for no limit
								{/if}
							</span>
						</label>
					</div>
				</div>
			</div>

			<!-- Alert Messages -->
			{#if errorMessage}
				<div class="alert alert-error">
					<svg xmlns="http://www.w3.org/2000/svg" class="stroke-current shrink-0 h-6 w-6" fill="none" viewBox="0 0 24 24">
						<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z" />
					</svg>
					<span>{errorMessage}</span>
				</div>
			{/if}

			{#if saveSuccess}
				<div class="alert alert-success">
					<svg xmlns="http://www.w3.org/2000/svg" class="stroke-current shrink-0 h-6 w-6" fill="none" viewBox="0 0 24 24">
						<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
					</svg>
					<span>Payment settings saved successfully!</span>
				</div>
			{/if}

			<!-- Action Buttons -->
			<div class="card-actions justify-end pt-4">
				<button
					type="submit"
					class="btn btn-primary"
					disabled={isSaving}
				>
					{#if isSaving}
						<span class="loading loading-spinner loading-sm"></span>
						Saving...
					{:else}
						Save Settings
					{/if}
				</button>
			</div>
		</form>

		<!-- Info Box -->
		<div class="alert alert-info mt-6">
			<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" class="stroke-current shrink-0 w-6 h-6">
				<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
			</svg>
			<div class="text-sm">
				<p class="font-semibold">Need help with PayHere?</p>
				<p class="mt-1">Visit <a href="https://www.payhere.lk/" target="_blank" class="link">payhere.lk</a> to create a merchant account and get your credentials.</p>
			</div>
		</div>
	</div>
</div>