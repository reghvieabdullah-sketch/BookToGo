<script lang="ts">
	let isLoading = false;
	let phoneNumber = '';
	let touched = false;

	export let { data };
	import { page } from '$app/stores';
	import Seo from '$lib/adminAssets/Seo.svelte';
	const next = $page.url.searchParams.get('next') ?? '/';

	// Sri Lankan mobile numbers:
	// Accepts: 07XXXXXXXX (10 digits) or +947XXXXXXXX / 947XXXXXXXX
	// Valid mobile prefixes: 070,071,072,074,075,076,077,078
	const LK_PHONE_REGEX = /^(?:\+?94|0)?7[0124-8]\d{7}$/;
	function normalizedPhone(raw: string) {
		const digits = raw.replace(/[\s-]/g, '');
		return digits;
	}

	$: cleanedPhone = normalizedPhone(phoneNumber);
	$: isPhoneValid = LK_PHONE_REGEX.test(cleanedPhone);

	// Normalize to +94XXXXXXXXX for storage/consistency
	$: e164Phone = isPhoneValid
		? '+94' + cleanedPhone.replace(/^(\+?94|0)/, '')
		: '';

	function handleSubmit(e: SubmitEvent) {
		if (!isPhoneValid) {
			e.preventDefault();
			touched = true;
			return;
		}
		isLoading = true;
	}
</script>

<Seo image={'https://booktogo.lk/logo.png'} title={'Login | BookToGo'} description={'Sign in to book or view your dashboard'} url={`https://${data.venueURL ? `${data.venueURL}.` : ''}booktogo.lk/auth`} noindex={true}/>

<div class="flex min-h-screen items-center justify-center bg-base-200 px-4 py-10">
	<div class="relative w-full max-w-[380px]">
		{#if isLoading}
			<div
				class="absolute inset-0 z-20 flex items-center justify-center rounded-2xl bg-base-100/80 backdrop-blur-[1px]"
			>
				<span class="loading loading-md loading-spinner text-primary"></span>
			</div>
		{/if}

		<div class="rounded-2xl border border-base-300 bg-base-100 p-8 shadow-sm">
			<!-- Header -->
			<div class="mb-7 text-center">
				<h1 class="text-xl font-semibold tracking-tight">Sign in</h1>
				<p class="mt-1.5 text-sm text-base-content/60">
					Use your Google account to continue
				</p>
			</div>

			<form
				method="POST"
				action="?/loginWithGoogle&next={encodeURIComponent(next)}"
				on:submit={handleSubmit}
			>
				<!-- Phone field -->
				<label class="mb-1.5 block text-sm font-medium" for="phone">
					Phone number
				</label>
				<div
					class="flex items-center gap-2 rounded-lg border border-base-300 bg-base-100 px-3 transition-colors focus-within:border-primary"
					class:!border-error={touched && !isPhoneValid && phoneNumber.length > 0}
				>
					<span class="select-none text-sm text-base-content/50">+94</span>
					<div class="h-5 w-px bg-base-300"></div>
					<input
						id="phone"
						type="tel"
						inputmode="tel"
						placeholder="77 123 4567"
						class="h-11 w-full grow bg-transparent text-sm outline-none placeholder:text-base-content/35"
						bind:value={phoneNumber}
						on:blur={() => (touched = true)}
						required
						disabled={isLoading}
					/>
				</div>

				<div class="mt-1.5 min-h-[1.25rem]">
					{#if touched && phoneNumber.length > 0 && !isPhoneValid}
						<p class="text-xs text-error">
							Enter a valid Sri Lankan mobile number, e.g. 77 123 4567
						</p>
					{/if}
				</div>

				<input type="hidden" name="phone" value={e164Phone} />

				<button
					type="submit"
					class="btn mt-2 flex w-full items-center justify-center gap-3 rounded-lg btn-outline btn-md normal-case"
					disabled={isLoading || !isPhoneValid}
				>
					<svg
						width="18"
						height="18"
						viewBox="0 0 533.5 544.3"
						xmlns="http://www.w3.org/2000/svg"
						aria-hidden="true"
						focusable="false"
					>
						<path
							fill="#4285F4"
							d="M533.5 278.4c0-18.5-1.6-36.3-4.7-53.6H272.1v101.5h146.6c-6.3 34-25.1 62.8-53.6 82v68.2h86.5c50.5-46.6 81.9-115 81.9-198.1z"
						/>
						<path
							fill="#34A853"
							d="M272.1 544.3c72.9 0 134.2-24.1 178.9-65.4l-86.5-68.2c-24.1 16.2-55 25.8-92.4 25.8-71 0-131.3-47.9-152.7-112.3H31.2v70.6C76.1 480.6 169.6 544.3 272.1 544.3z"
						/>
						<path
							fill="#FBBC05"
							d="M119.4 323.9c-11.8-35.4-11.8-73.8 0-109.2V144.1H31.2c-39.7 79.8-39.7 174.6 0 254.5l88.2-74.7z"
						/>
						<path
							fill="#EA4335"
							d="M272.1 107.7c39.7 0 75.3 13.6 103.3 40.4l77.4-77.4C404.6 24.6 344.8 0 272.1 0 169.6 0 76.1 63.7 31.2 159.8l88.2 70.6c21.4-64.4 81.7-112.7 152.7-112.7z"
						/>
					</svg>
					<span class="text-sm font-medium">Sign in with Google</span>
				</button>

				{#if !isPhoneValid}
					<p class="mt-3 text-center text-xs text-base-content/45">
						Enter your phone number to continue
					</p>
				{/if}
			</form>
		</div>

		<p class="mt-5 text-center text-xs leading-relaxed text-base-content/50">
			Your phone number may be used by the venue to contact you. We do not share your phone number with third parties.
		</p>
	</div>
</div>