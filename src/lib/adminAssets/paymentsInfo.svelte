<script>
	let paymentMethod = 'bank'; // 'bank' or 'card'
	let acceptCash = false;
	let maxPaymentAmount = '';
	
	// Bank transfer fields
	let bankName = '';
	let accountName = '';
	let accountNumber = '';
	let routingNumber = '';
	let swiftCode = '';
	
	// Card fields
	let cardNumber = '';
	let cardHolderName = '';
	let expiryMonth = '';
	let expiryYear = '';
	
	let saveStatus = '';
	
	function formatCardNumber(value) {
		return value.replace(/\s/g, '').replace(/(\d{4})/g, '$1 ').trim();
	}
	
	function handleCardInput(e) {
		const value = e.target.value.replace(/\s/g, '');
		if (value.length <= 16) {
			cardNumber = formatCardNumber(value);
		}
	}
	
	function handleSubmit() {
		// Validate required fields
		if (paymentMethod === 'bank') {
			if (!bankName || !accountName || !accountNumber) {
				saveStatus = 'error';
				setTimeout(() => saveStatus = '', 3000);
				return;
			}
		} else {
			if (!cardNumber || !cardHolderName || !expiryMonth || !expiryYear) {
				saveStatus = 'error';
				setTimeout(() => saveStatus = '', 3000);
				return;
			}
		}
		
		// Simulate save
		saveStatus = 'success';
		setTimeout(() => saveStatus = '', 3000);
	}
	
	const currentYear = new Date().getFullYear();
	const years = Array.from({length: 15}, (_, i) => currentYear + i);
	const months = ['01', '02', '03', '04', '05', '06', '07', '08', '09', '10', '11', '12'];
</script>

<div class="min-h-screen bg-base-200 p-4 sm:p-6 lg:p-8">
	<div class="max-w-4xl mx-auto">
		<div class="mb-6">
			<h1 class="text-3xl font-bold">Payment Settings</h1>
			<p class="text-base-content/70 mt-2">Configure how you want to receive payments from your booking customers</p>
		</div>

		<div class="card bg-base-100 shadow-xl">
			<div class="card-body p-3 sm:p-6 lg:p-8">
				
				<!-- Payment Method Selection -->
				<div class="form-control mb-6">
					<label class="label">
						<span class="label-text font-semibold text-lg">Payment Method</span>
					</label>
					<div class="flex gap-4">
						<label class="cursor-pointer flex items-center gap-2">
							<input 
								type="radio" 
								name="paymentMethod" 
								class="radio radio-primary" 
								value="bank"
								bind:group={paymentMethod}
							/>
							<span>Bank Transfer</span>
						</label>
						<label class="cursor-pointer flex items-center gap-2">
							<input 
								type="radio" 
								name="paymentMethod" 
								class="radio radio-primary" 
								value="card"
								bind:group={paymentMethod}
							/>
							<span>Debit/Credit Card</span>
						</label>
					</div>
				</div>

				<div class="divider"></div>

				{#if paymentMethod === 'bank'}
					<!-- Bank Transfer Details -->
					<div class="space-y-4">
						<h3 class="text-xl font-semibold mb-4">Bank Account Details</h3>
						
						<div class="form-control">
							<label class="label">
								<span class="label-text">Bank Name <span class="text-error">*</span></span>
							</label>
							<input 
								type="text" 
								placeholder="e.g., Wells Fargo, Bank of America" 
								class="input input-bordered w-full"
								bind:value={bankName}
							/>
						</div>

						<div class="form-control">
							<label class="label">
								<span class="label-text">Account Holder Name <span class="text-error">*</span></span>
							</label>
							<input 
								type="text" 
								placeholder="Full name as it appears on account" 
								class="input input-bordered w-full"
								bind:value={accountName}
							/>
						</div>

						<div class="grid grid-cols-1 md:grid-cols-2 gap-4">
							<div class="form-control">
								<label class="label">
									<span class="label-text">Account Number <span class="text-error">*</span></span>
								</label>
								<input 
									type="text" 
									placeholder="Your account number" 
									class="input input-bordered w-full"
									bind:value={accountNumber}
								/>
							</div>

						</div>


					</div>
				{:else}
					<!-- Card Details -->
					<div class="space-y-4">
						<h3 class="text-xl font-semibold mb-4">Card Details</h3>
						
						<div class="form-control">
							<label class="label">
								<span class="label-text">Card Number <span class="text-error">*</span></span>
							</label>
							<input 
								type="text" 
								placeholder="1234 5678 9012 3456" 
								class="input input-bordered w-full font-mono"
								value={cardNumber}
								on:input={handleCardInput}
								maxlength="19"
							/>
						</div>

						<div class="form-control">
							<label class="label">
								<span class="label-text">Cardholder Name <span class="text-error">*</span></span>
							</label>
							<input 
								type="text" 
								placeholder="Name as it appears on card" 
								class="input input-bordered w-full"
								bind:value={cardHolderName}
							/>
						</div>

						<div class="grid grid-cols-2 gap-4">
							<div class="form-control">
								<label class="label">
									<span class="label-text">Expiry Month <span class="text-error">*</span></span>
								</label>
								<select class="select select-bordered w-full" bind:value={expiryMonth}>
									<option value="">Month</option>
									{#each months as month}
										<option value={month}>{month}</option>
									{/each}
								</select>
							</div>

							<div class="form-control">
								<label class="label">
									<span class="label-text">Expiry Year <span class="text-error">*</span></span>
								</label>
								<select class="select select-bordered w-full" bind:value={expiryYear}>
									<option value="">Year</option>
									{#each years as year}
										<option value={year}>{year}</option>
									{/each}
								</select>
							</div>
						</div>

						<div class="alert alert-info">
							<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" class="stroke-current shrink-0 w-6 h-6">
								<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
							</svg>
							<span class="text-sm">CVV is not required. This card will be used to receive payments only.</span>
						</div>
					</div>
				{/if}

				<div class="divider"></div>

				<!-- Additional Payment Options -->
				<div class="space-y-4">
					<h3 class="text-xl font-semibold mb-4">Additional Options</h3>
					
					<div class="form-control">
						<label class="label cursor-pointer justify-start gap-3">
							<input 
								type="checkbox" 
								class="checkbox checkbox-primary" 
								bind:checked={acceptCash}
							/>
							<div>
								<span class="label-text font-medium">Accept Cash Payments</span>
								<p class="text-sm text-base-content/60 mt-1">Allow customers to pay in cash at your venue</p>
							</div>
						</label>
					</div>

					<div class="form-control">
						<label class="label">
							<span class="label-text font-medium">Maximum Payment Amount</span>
							<span class="label-text-alt text-base-content/60">Optional</span>
						</label>
						<label class="input input-bordered flex items-center gap-2">
							<span>LKR</span>
							<input 
								type="number" 
								placeholder="e.g., 5000" 
								class="grow"
								min="0"
								step="50"
								bind:value={maxPaymentAmount}
							/>
						</label>
						<label class="label">
							<span class="label-text-alt text-base-content/60">
								Set a maximum amount per transaction. Leave empty for no limit.
							</span>
						</label>
					</div>
				</div>

				<div class="divider"></div>

				<!-- Action Buttons -->
				<div class="card-actions justify-end mt-6 w-full">
					{#if saveStatus === 'success'}
						<div class="alert alert-success">
							<svg xmlns="http://www.w3.org/2000/svg" class="stroke-current shrink-0 h-6 w-6" fill="none" viewBox="0 0 24 24">
								<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
							</svg>
							<span>Payment details saved successfully!</span>
						</div>
					{:else if saveStatus === 'error'}
						<div class="alert alert-error">
							<svg xmlns="http://www.w3.org/2000/svg" class="stroke-current shrink-0 h-6 w-6" fill="none" viewBox="0 0 24 24">
								<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z" />
							</svg>
							<span>Please fill in all required fields.</span>
						</div>
					{/if}
				</div>

				<div class="flex flex-col sm:flex-row gap-3 mt-4">
					<button class="btn btn-outline flex-1">Cancel</button>
					<button class="btn btn-primary flex-1" on:click={handleSubmit}>
						Save Payment Details
					</button>
				</div>

			</div>
		</div>

		<!-- Security Note -->
		<div class="mt-6 p-4 bg-base-100 rounded-lg shadow">
			<div class="flex gap-3">
				<svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6 text-success shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
					<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
				</svg>
				<div>
					<p class="font-semibold">Your information is secure</p>
					<p class="text-sm text-base-content/70 mt-1">
						Your payment details are encrypted and stored securely. We never share your financial information with third parties.
					</p>
				</div>
			</div>
		</div>

	</div>
</div>