<script lang="ts">
	let isLoading = false;
	import { page } from '$app/stores';
	const next = $page.url.searchParams.get('next') ?? '/';
</script>

<div class="flex min-h-screen items-center justify-center bg-base-200 px-4">
	<div class="card relative w-full max-w-sm bg-base-100 p-6 shadow-xl">
		{#if isLoading}
			<div class="absolute inset-0 z-20 flex items-center justify-center bg-base-100/80">
				<span class="loading loading-lg loading-spinner text-primary"></span>
			</div>
		{/if}

		<p class="mb-2 text-center text-lg font-semibold opacity-90">Sign in</p>
		<p class="mb-6 text-center text-sm opacity-60">Use your Google account to continue</p>

		<!-- Google login -->
		<form
			method="POST"
			action="?/loginWithGoogle&next={encodeURIComponent(next)}"
			on:submit={() => (isLoading = true)}
		>
			<button
				type="submit"
				class="btn flex w-full items-center justify-center gap-3 rounded-none! btn-outline btn-md"
				disabled={isLoading}
			>
				<span aria-hidden="true" class="h-5 w-5">
					<svg
						width="20"
						height="20"
						viewBox="0 0 533.5 544.3"
						xmlns="http://www.w3.org/2000/svg"
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
				</span>

				<!-- Visible label (per Google: "Sign in with Google" or "Sign up with Google" depending on flow) -->
				<span>Sign in with Google</span>

				<!-- Hidden text for screen readers (prevents double-reading the label) -->
				<span class="sr-only">Sign in with Google</span>
			</button>
		</form>

		<p class="mt-4 flex items-center justify-center gap-2 text-center text-sm text-warning">
			You may miss important features if you skip signing in
		</p>
	</div>
</div>
