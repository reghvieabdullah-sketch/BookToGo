<script>
	import { onMount } from 'svelte';

	let currentDate = '';

	onMount(() => {
		currentDate = new Date().toLocaleDateString('en-US', {
			year: 'numeric',
			month: 'long',
			day: 'numeric'
		});
	});
</script>

<svelte:head>
	<title>Privacy Policy | BookToGo</title>
	<meta
		name="description"
		content="Read BookToGo’s privacy policy to learn how we handle your data responsibly and securely."
	/>
	<link rel="canonical" href="https://booktogo.lk/privacy-policy" />

	<meta property="og:title" content="BookToGo Privacy Policy" />
	<meta property="og:description" content="Learn how BookToGo protects your data and privacy." />
	<meta property="og:url" content="https://booktogo.lk/privacy-policy" />
</svelte:head>

<div class="min-h-screen bg-base-100">
	<!-- Hero Section -->
	<div class="hero bg-primary text-primary-content py-16">
		<div class="hero-content text-center">
			<div class="max-w-md">
				<h1 class="text-5xl font-bold mb-4">Privacy Policy</h1>
				<p class="text-lg opacity-90 text-white">Last updated: August 20, 2025</p>
			</div>
		</div>
	</div>

	<!-- Main Content -->
	<div class="container mx-auto px-4 py-12 max-w-4xl">
		<!-- Introduction -->
		<div class="card bg-base-200 shadow-xl mb-8">
			<div class="card-body">
				<h2 class="card-title text-2xl text-primary mb-4">
					<svg
						xmlns="http://www.w3.org/2000/svg"
						class="h-8 w-8"
						fill="none"
						viewBox="0 0 24 24"
						stroke="currentColor"
					>
						<path
							stroke-linecap="round"
							stroke-linejoin="round"
							stroke-width="2"
							d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
						/>
					</svg>
					Introduction
				</h2>
				<p class="text-base-content/80 leading-relaxed">
					Welcome to <span class="font-semibold text-primary">booktogo.lk</span> ("we," "our," or
					"us"). We respect your privacy and want to be transparent about how we handle your information.
					This Privacy Policy explains what data we collect, how we use it, and your choices.
				</p>
			</div>
		</div>

		<!-- Information We Collect -->
		<div class="card bg-base-200 shadow-xl mb-8">
			<div class="card-body">
				<h2 class="card-title text-2xl text-primary mb-6">
					<svg
						xmlns="http://www.w3.org/2000/svg"
						class="h-8 w-8"
						fill="none"
						viewBox="0 0 24 24"
						stroke="currentColor"
					>
						<path
							stroke-linecap="round"
							stroke-linejoin="round"
							stroke-width="2"
							d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
						/>
					</svg>
					Information We Collect
				</h2>

				<div class="space-y-6">
					<!-- Information You Provide -->
					<div class="collapse collapse-plus bg-base-100">
						<input type="radio" name="collect-accordion" checked="checked" />
						<div class="collapse-title text-xl font-medium text-black">Information You Provide</div>
						<div class="collapse-content">
							<ul class="space-y-3">
								<li class="flex items-start gap-3">
									<div>
										<strong class="text-base-content">Account Information:</strong>
										<span class="text-base-content/80">
											When you sign in, we collect your email address (through Google OAuth).</span
										>
									</div>
								</li>
								<li class="flex items-start gap-3">
									<div>
										<strong class="text-base-content">User-Generated Content:</strong>
										<span class="text-base-content/80">
											Your answers, drawings, notes, and tagged questions are stored in your
											account.</span
										>
									</div>
								</li>
								<li class="flex items-start gap-3">
									<div>
										<strong class="text-base-content">Messages:</strong>
										<span class="text-base-content/80">
											Any emails or contact requests you send us.</span
										>
									</div>
								</li>
							</ul>
						</div>
					</div>

					<!-- Information Collected Automatically -->
					<div class="collapse collapse-plus bg-base-100">
						<input type="radio" name="collect-accordion" />
						<div class="collapse-title text-xl font-medium text-black">
							Information Collected Automatically
						</div>
						<div class="collapse-content">
							<ul class="space-y-3">
								<li class="flex items-start gap-3">
									<div>
										<strong class="text-base-content">Usage Data:</strong>
										<span class="text-base-content/80">
											Pages visited, features used, time spent.</span
										>
									</div>
								</li>
								<li class="flex items-start gap-3">
									<div>
										<strong class="text-base-content">Device Info:</strong>
										<span class="text-base-content/80">
											Browser, operating system, device identifiers.</span
										>
									</div>
								</li>
								<li class="flex items-start gap-3">
									<div>
										<strong class="text-base-content">Authentication Data:</strong>
										<span class="text-base-content/80">
											From Google OAuth (email, profile picture, basic info).</span
										>
									</div>
								</li>
							</ul>
						</div>
					</div>

					<!-- Cookies -->
					<div class="collapse collapse-plus bg-base-100">
						<input type="radio" name="collect-accordion" />
						<div class="collapse-title text-xl font-medium text-black">
							Cookies and Similar Technologies
						</div>
						<div class="collapse-content">
							<p class="mb-3 text-base-content/80">We use cookies to:</p>
							<ul class="space-y-2">
								<li class="flex items-center gap-2">
									<span class="text-base-content/80">Keep you signed in</span>
								</li>
								<li class="flex items-center gap-2">
									<span class="text-base-content/80">Remember preferences</span>
								</li>
								<li class="flex items-center gap-2">
									<span class="text-base-content/80">Analyze usage patterns</span>
								</li>
								<li class="flex items-center gap-2">
									<span class="text-base-content/80">Protect the platform's security</span>
								</li>
							</ul>
						</div>
					</div>
				</div>
			</div>
		</div>

		<!-- How We Use Your Information -->
		<div class="card bg-base-200 shadow-xl mb-8">
			<div class="card-body">
				<h2 class="card-title text-2xl text-primary mb-4">
					<svg
						xmlns="http://www.w3.org/2000/svg"
						class="h-8 w-8"
						fill="none"
						viewBox="0 0 24 24"
						stroke="currentColor"
					>
						<path
							stroke-linecap="round"
							stroke-linejoin="round"
							stroke-width="2"
							d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z"
						/>
						<path
							stroke-linecap="round"
							stroke-linejoin="round"
							stroke-width="2"
							d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
						/>
					</svg>
					How We Use Your Information
				</h2>
				<div class="grid md:grid-cols-2 gap-4">
					<div class="stat bg-base-100 rounded-lg">
						<div class="stat-figure text-primary">
							<svg
								xmlns="http://www.w3.org/2000/svg"
								class="w-8 h-8"
								fill="none"
								viewBox="0 0 24 24"
								stroke="currentColor"
							>
								<path
									stroke-linecap="round"
									stroke-linejoin="round"
									stroke-width="2"
									d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
								/>
							</svg>
						</div>
						<div class="stat-title">Provide Our Service</div>
						<div class="stat-desc">To run your account and save your work</div>
					</div>
					<div class="stat bg-base-100 rounded-lg">
						<div class="stat-figure text-black">
							<svg
								xmlns="http://www.w3.org/2000/svg"
								class="w-8 h-8"
								fill="none"
								viewBox="0 0 24 24"
								stroke="currentColor"
							>
								<path
									stroke-linecap="round"
									stroke-linejoin="round"
									stroke-width="2"
									d="M13 10V3L4 14h7v7l9-11h-7z"
								/>
							</svg>
						</div>
						<div class="stat-title">Improve Features</div>
						<div class="stat-desc">To see how people use the platform and make it better</div>
					</div>
					<div class="stat bg-base-100 rounded-lg">
						<div class="stat-figure text-accent">
							<svg
								xmlns="http://www.w3.org/2000/svg"
								class="w-8 h-8"
								fill="none"
								viewBox="0 0 24 24"
								stroke="currentColor"
							>
								<path
									stroke-linecap="round"
									stroke-linejoin="round"
									stroke-width="2"
									d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
								/>
							</svg>
						</div>
						<div class="stat-title">Personalization</div>
						<div class="stat-desc">To remember preferences</div>
					</div>
					<div class="stat bg-base-100 rounded-lg">
						<div class="stat-figure text-warning">
							<svg
								xmlns="http://www.w3.org/2000/svg"
								class="w-8 h-8"
								fill="none"
								viewBox="0 0 24 24"
								stroke="currentColor"
							>
								<path
									stroke-linecap="round"
									stroke-linejoin="round"
									stroke-width="2"
									d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"
								/>
							</svg>
						</div>
						<div class="stat-title">Security & Communication</div>
						<div class="stat-desc">To detect misuse and send important updates</div>
					</div>
				</div>
			</div>
		</div>

		<!-- Information Sharing -->
		<div class="card bg-base-200 shadow-xl mb-8">
			<div class="card-body">
				<h2 class="card-title text-2xl text-primary mb-4">
					<svg
						xmlns="http://www.w3.org/2000/svg"
						class="h-8 w-8"
						fill="none"
						viewBox="0 0 24 24"
						stroke="currentColor"
					>
						<path
							stroke-linecap="round"
							stroke-linejoin="round"
							stroke-width="2"
							d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.367 2.684 3 3 0 00-5.367-2.684z"
						/>
					</svg>
					Information Sharing
				</h2>
				<div class="alert alert-info mb-4">
					<svg
						xmlns="http://www.w3.org/2000/svg"
						class="stroke-current shrink-0 h-6 w-6"
						fill="none"
						viewBox="0 0 24 24"
					>
						<path
							stroke-linecap="round"
							stroke-linejoin="round"
							stroke-width="2"
							d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
						/>
					</svg>
					<span class="font-semibold">We don't sell your information.</span>
				</div>
				<p class="mb-4 text-base-content/80">We only share with:</p>
				<div class="space-y-3">
					<div class="flex items-center gap-3 p-3 bg-base-100 rounded-lg">
						<div class="badge badge-primary">✓</div>
						<div>
							<strong>Supabase</strong>
							<span class="text-base-content/80"
								>(database & authentication provider, hosted in East India region)</span
							>
						</div>
					</div>
					<div class="flex items-center gap-3 p-3 bg-base-100 rounded-lg">
						<div class="badge badge-primary">✓</div>
						<div>
							<strong>Google OAuth</strong>
							<span class="text-base-content/80">(if you choose to sign in with Google)</span>
						</div>
					</div>
					<div class="flex items-center gap-3 p-3 bg-base-100 rounded-lg">
						<div class="badge badge-primary">✓</div>
						<div>
							<strong>Hosting Services</strong>
							<span class="text-base-content/80">(to deliver the website)</span>
						</div>
					</div>
				</div>
				<div class="alert alert-warning mt-4">
					<svg
						xmlns="http://www.w3.org/2000/svg"
						class="stroke-current shrink-0 h-6 w-6"
						fill="none"
						viewBox="0 0 24 24"
					>
						<path
							stroke-linecap="round"
							stroke-linejoin="round"
							stroke-width="2"
							d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z"
						/>
					</svg>
					<span>We may also share information if required by law.</span>
				</div>
			</div>
		</div>

		<!-- Data Storage & Security -->
		<div class="card bg-base-200 shadow-xl mb-8">
			<div class="card-body">
				<h2 class="card-title text-2xl text-primary mb-4">
					<svg
						xmlns="http://www.w3.org/2000/svg"
						class="h-8 w-8"
						fill="none"
						viewBox="0 0 24 24"
						stroke="currentColor"
					>
						<path
							stroke-linecap="round"
							stroke-linejoin="round"
							stroke-width="2"
							d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"
						/>
					</svg>
					Data Storage & Security
				</h2>
				<div class="grid md:grid-cols-3 gap-4">
					<div class="card bg-base-100">
						<div class="card-body text-center">
							<div class="text-3xl mb-2">🌍</div>
							<h3 class="card-title text-lg justify-center">Location</h3>
							<p class="text-sm">Data stored in Supabase (East India region)</p>
						</div>
					</div>
					<div class="card bg-base-100">
						<div class="card-body text-center">
							<div class="text-3xl mb-2">🔒</div>
							<h3 class="card-title text-lg justify-center">Security</h3>
							<p class="text-sm">Industry-standard encryption for data in transit</p>
						</div>
					</div>
					<div class="card bg-base-100">
						<div class="card-body text-center">
							<div class="text-3xl mb-2">👥</div>
							<h3 class="card-title text-lg justify-center">Access</h3>
							<p class="text-sm">Only authorized team members can access your data</p>
						</div>
					</div>
				</div>
			</div>
		</div>

		<!-- Your Rights & Choices -->
		<div class="card bg-base-200 shadow-xl mb-8">
			<div class="card-body">
				<h2 class="card-title text-2xl text-primary mb-4">
					<svg
						xmlns="http://www.w3.org/2000/svg"
						class="h-8 w-8"
						fill="none"
						viewBox="0 0 24 24"
						stroke="currentColor"
					>
						<path
							stroke-linecap="round"
							stroke-linejoin="round"
							stroke-width="2"
							d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"
						/>
					</svg>
					Your Rights & Choices
				</h2>
				<div class="space-y-4">
					<div class="flex gap-4 p-4 bg-base-100 rounded-lg">
						<div class="badge badge-primary badge-sm mt-2"></div>

						<div>
							<h3 class="font-semibold text-lg">Access</h3>
							<p class="text-base-content/80">
								You can see the data stored in your account by logging in.
							</p>
						</div>
					</div>
					<div class="flex gap-4 p-4 bg-base-100 rounded-lg">
						<div class="badge badge-primary badge-sm mt-2"></div>

						<div>
							<h3 class="font-semibold text-lg">Update</h3>
							<p class="text-base-content/80">
								You can update your Google account info (we only pull what you allow).
							</p>
						</div>
					</div>
					<div class="flex gap-4 p-4 bg-base-100 rounded-lg">
						<div class="badge badge-primary badge-sm mt-2"></div>

						<div>
							<h3 class="font-semibold text-lg">Delete</h3>
							<p class="text-base-content/80">
								Full self-service deletion isn't built yet. If you want your account/data removed,
								email us and we'll handle it manually.
							</p>
						</div>
					</div>
					<div class="flex gap-4 p-4 bg-base-100 rounded-lg">
						<div class="badge badge-primary badge-sm mt-2"></div>

						<div>
							<h3 class="font-semibold text-lg">Communication</h3>
							<p class="text-base-content/80">You can opt out of non-essential emails.</p>
						</div>
					</div>
				</div>
			</div>
		</div>

		<!-- Remaining sections in a more compact format -->
		<div class="grid lg:grid-cols-2 gap-8 mb-8">
			<!-- Data Retention -->
			<div class="card bg-base-200 shadow-xl">
				<div class="card-body">
					<h2 class="card-title text-xl text-primary mb-3">Data Retention</h2>
					<ul class="space-y-2 text-sm">
						<li><strong>Account Data:</strong> Kept while your account is active</li>
						<li><strong>User Content:</strong> Kept unless you ask for deletion</li>
						<li>
							<strong>Deleted Accounts:</strong> Manual deletion on request (automated deletion within
							30 days not yet implemented)
						</li>
						<li><strong>Usage Data:</strong> May be kept in anonymized form for analytics</li>
					</ul>
				</div>
			</div>

			<!-- Third-Party Services -->
			<div class="card bg-base-200 shadow-xl">
				<div class="card-body">
					<h2 class="card-title text-xl text-primary mb-3">Third-Party Services</h2>
					<ul class="space-y-2 text-sm">
						<li>
							<strong>Google OAuth:</strong> We only request the minimum data needed for login (email
							+ profile basics)
						</li>
						<li>
							<strong>Educational Content:</strong> Exam materials belong to their original copyright
							holders. We do not claim ownership and only provide them for educational use
						</li>
					</ul>
				</div>
			</div>
		</div>

		<div class="grid lg:grid-cols-2 gap-8 mb-8">
			<!-- Children's Privacy -->
			<div class="card bg-base-200 shadow-xl">
				<div class="card-body">
					<h2 class="card-title text-xl text-primary mb-3">Children's Privacy</h2>
					<p class="text-sm text-base-content/80">
						booktogo.lk is built for students. If you are under 13, you should use this platform
						only with parental/guardian supervision. We do not knowingly collect personal data from
						children under 13 without consent.
					</p>
				</div>
			</div>

			<!-- International Users -->
			<div class="card bg-base-200 shadow-xl">
				<div class="card-body">
					<h2 class="card-title text-xl text-primary mb-3">International Users</h2>
					<p class="text-sm text-base-content/80">
						Data is stored in the East India region via Supabase. If you use our service from
						elsewhere, your information may be transferred and processed there.
					</p>
				</div>
			</div>
		</div>

		<!-- Changes to this Policy -->
		<div class="card bg-base-200 shadow-xl mb-8">
			<div class="card-body">
				<h2 class="card-title text-xl text-primary mb-3">Changes to this Policy</h2>
				<p class="text-base-content/80 mb-3">
					We may update this Privacy Policy. If we make big changes, we'll:
				</p>
				<div class="steps steps-vertical lg:steps-horizontal">
					<div class="step step-primary">Update the "Last updated" date</div>
					<div class="step step-primary">Post a notice on our site</div>
				</div>
			</div>
		</div>

		<!-- Contact -->
		<div class="card bg-primary text-primary-content shadow-xl">
			<div class="card-body text-center">
				<h2 class="card-title text-2xl justify-center mb-4">
					<svg
						xmlns="http://www.w3.org/2000/svg"
						class="h-8 w-8"
						fill="none"
						viewBox="0 0 24 24"
						stroke="currentColor"
					>
						<path
							stroke-linecap="round"
							stroke-linejoin="round"
							stroke-width="2"
							d="M3 8l7.89 4.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
						/>
					</svg>
					Contact Us
				</h2>
				<p class="mb-4">If you have questions about this Privacy Policy:</p>
				<a href="mailto:reghvieabdullah@gmail.com" class="btn btn-neutral rounded-none!">
					<svg
						xmlns="http://www.w3.org/2000/svg"
						class="h-5 w-5 mr-2"
						fill="none"
						viewBox="0 0 24 24"
						stroke="currentColor"
					>
						<path
							stroke-linecap="round"
							stroke-linejoin="round"
							stroke-width="2"
							d="M3 8l7.89 4.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
						/>
					</svg>
					reghvieabdullah@gmail.com
				</a>
			</div>
		</div>
	</div>

	<!-- Footer spacer -->
	<div class="py-8"></div>
</div>

<style>
	:global(html) {
		scroll-behavior: smooth;
	}

	.steps .step:before {
		content: counter(step-counter);
	}
</style>
