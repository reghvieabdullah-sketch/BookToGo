<script lang="ts">
	import customerBookingVideo from '$lib/vids/compressed_customer_booking.mp4';

	const problems = [
		{
			title: 'Endless booking calls',
			text: 'Customers can see availability and book without calling you to ask what is free.'
		},
		{
			title: 'WhatsApp chaos',
			text: 'Stop digging through conversations to figure out who booked what and when.'
		},
		{
			title: 'Manual schedules',
			text: 'Manage courts, availability, pricing and bookings from one simple dashboard.'
		},
		{
			title: 'Ghost bookings',
			text: 'Online payments are coming soon, helping turn reservations into confirmed bookings.'
		}
	];

	const steps = [
		{
			number: '01',
			title: 'Set up your venue',
			text: 'Add your courts, opening hours, pricing and availability.'
		},
		{
			number: '02',
			title: 'Share your booking page',
			text: 'Give customers one simple link where they can see what is available.'
		},
		{
			number: '03',
			title: 'Let them book',
			text: 'Customers choose their court and time while your schedule updates automatically.'
		}
	];

	// --- Contact form state ---
	// TODO: point this at your real endpoint (e.g. an API route, form backend, or serverless function)
	const CONTACT_API_URL = '/api/v1/contact';

	let contactName = '';
	let contactEmail = '';
	let contactPhone = '';

	type SubmitState = 'idle' | 'submitting' | 'success' | 'error';
	let submitState: SubmitState = 'idle';
	let errorMessage = '';

	function isValidEmail(value: string) {
		return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
	}

	async function handleContactSubmit(event: SubmitEvent) {
		event.preventDefault();
		errorMessage = '';

		if (!contactName.trim()) {
			errorMessage = 'Please enter your name.';
			return;
		}
		if (!contactEmail.trim() || !isValidEmail(contactEmail)) {
			errorMessage = 'Please enter a valid email address.';
			return;
		}
		if (!contactPhone.trim()) {
			errorMessage = 'Please enter your phone number.';
			return;
		}

		submitState = 'submitting';

		try {
			const response = await fetch(CONTACT_API_URL, {
				method: 'POST',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify({
					contactName: contactName.trim(),
					contactEmail: contactEmail.trim(),
					contactPhone: contactPhone.trim()
				})
			});

			if (!response.ok) {
				throw new Error(`Request failed with status ${response.status}`);
			}

			submitState = 'success';
			contactName = '';
			contactEmail = '';
			contactPhone = '';
		} catch (err) {
			console.error('Contact form submission failed:', err);
			submitState = 'error';
			errorMessage = `${err} is the rr`;
		}
	}
</script>
<!-- 
<svelte:head>
	<title>BookToGo — Let your customers book themselves</title>
	<meta
		name="description"
		content="BookToGo helps sports venues spend less time answering booking calls and messages, and more time running their venue."
	/>
</svelte:head> -->

<div class="bg-base-100 text-base-content">
	<!-- NAVBAR -->
	
	<!-- HERO -->
	<section class="relative overflow-hidden">
		<div class="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
			<div class="grid items-center gap-14 py-16 lg:grid-cols-[1fr_1.05fr] lg:py-24">
				<!-- Hero copy -->
				<div class="max-w-2xl">
					<div class="badge badge-primary badge-outline mb-6 gap-2 px-4 py-3">
						<span class="size-2 rounded-full bg-primary"></span>
						Booking, without the busywork
					</div>

					<h1
						class="text-5xl font-black leading-[0.95] tracking-tight sm:text-6xl lg:text-7xl"
					>
						Let your customers
						<span class="text-primary">book themselves.</span>
					</h1>

					<p class="mt-7 max-w-xl hidden leading-8 text-base-content/65 sm:text-xl sm:block">
						Stop spending your day answering “Is 7 PM available?”
						BookToGo gives your customers an easy way to book while
						you get one simple place to manage it all.
					</p>
					<div class="mt-9 flex flex-col gap-3 sm:flex-row">
						<a
							href="#get-started"
							class="btn btn-primary btn-lg shadow-lg shadow-primary/20"
						>
							Contact Us

							<svg
								xmlns="http://www.w3.org/2000/svg"
								viewBox="0 0 24 24"
								fill="none"
								stroke="currentColor"
								stroke-width="2"
								class="size-5"
							>
								<path d="M5 12h14" />
								<path d="m13 6 6 6-6 6" />
							</svg>
						</a>

						<a href="https://example.booktogo.lk" class="btn btn-ghost btn-lg">
							Try an example
						</a>
					</div>

					<div class="mt-8 flex flex-wrap gap-x-6 gap-y-2 text-sm text-base-content/50 hidden sm:block">
						<span class="flex items-center gap-2">
							<span class="text-success">✓</span>
							Easy to set up
						</span>

						<span class="flex items-center gap-2">
							<span class="text-success">✓</span>
							No complicated software
						</span>

						<span class="flex items-center gap-2">
							<span class="text-success">✓</span>
							Built for venues
						</span>
					</div>
				</div>

				<!-- Hero video -->
				<div class="relative">
					<!-- Decorative background -->
					<div
						class="absolute -inset-8 -z-10 rounded-[4rem] bg-primary/5 blur-3xl"
					></div>

					<div
						class="overflow-hidden rounded-2xl border border-base-300 bg-base-200 shadow-2xl"
					>
						<video
							class="block h-auto w-full"
							src={customerBookingVideo}
							autoplay
							muted
							loop
							playsinline
							preload="auto"
							disablepictureinpicture
							controlslist="nodownload nofullscreen noremoteplayback"
							aria-label="BookToGo customer booking demonstration"
						></video>
					</div>

					


				</div>
			</div>
		</div>
	</section>

	<!-- PAIN POINTS -->
	<section class="bg-base-200/60 py-24">
		<div class="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
			<div class="max-w-2xl">
				<p class="font-bold uppercase tracking-widest text-primary">Sound familiar?</p>

				<h2 class="mt-3 text-4xl font-black tracking-tight sm:text-5xl">
					Your venue shouldn't run on WhatsApp.
				</h2>

				<p class="mt-5 text-lg leading-8 text-base-content/60">
					Running a venue is already enough work. Booking shouldn't mean
					constantly checking messages, answering calls and updating schedules by hand.
				</p>
			</div>

			<div class="mt-12 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
				{#each problems as problem}
					<div
						class="card border border-base-300 bg-base-100 shadow-sm transition duration-300 hover:-translate-y-1 hover:shadow-lg"
					>
						<div class="card-body">

							<h3 class="mt-2 text-lg font-bold">{problem.title}</h3>
							<div class="divider my-2"></div>	
							<p class="text-sm leading-6 text-base-content/55">
								{problem.text}
							</p>
						</div>
					</div>
				{/each}
			</div>
		</div>
	</section>

	<!-- TRANSFORMATION -->
	<section class="py-24">
		<div class="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
			<div class="text-center">
				<p class="font-bold uppercase tracking-widest text-primary">The difference</p>

				<h2 class="mx-auto mt-3 max-w-3xl text-4xl font-black tracking-tight sm:text-5xl">
					From booking chaos to <span class="text-primary">booked.</span>
				</h2>
			</div>

			<div class="mt-14 grid items-center gap-6 lg:grid-cols-[1fr_auto_1fr]">
				<!-- Before -->
				<div class="card border border-base-300 bg-base-200">
					<div class="card-body p-7">
						<div class="flex items-center justify-between">
							<h3 class="font-bold">Before BookToGo</h3>
							<div class="badge badge-error badge-outline">Manual</div>
						</div>

						<div class="mt-5 space-y-3">
							<div class="chat chat-start">
								<div class="chat-bubble bg-base-100 text-base-content shadow-sm">
									Hi, is court 2 available at 7?
								</div>
							</div>

							<div class="chat chat-start">
								<div class="chat-bubble bg-base-100 text-base-content shadow-sm">
									What about tomorrow at 6?
								</div>
							</div>

							<div class="chat chat-start">
								<div class="chat-bubble bg-base-100 text-base-content shadow-sm">
									Can I book court 1 for Friday?
								</div>
							</div>

							<div class="alert border border-error/20 bg-error/5 text-sm">
								<span>🔔</span>
								<span>Another booking message...</span>
							</div>
						</div>
					</div>
				</div>

				<div class="hidden text-3xl text-primary lg:block">→</div>
				<div class="text-center text-3xl text-primary lg:hidden">↓</div>

				<!-- After -->
				<div class="card border-2 border-primary/20 bg-base-100 shadow-xl">
					<div class="card-body p-7">
						<div class="flex items-center justify-between">
							<h3 class="font-bold">With BookToGo</h3>
							<div class="badge badge-success badge-outline">Simple</div>
						</div>

						<div class="mt-5 space-y-3">
							<div class="flex items-center gap-3 rounded-xl bg-base-200 p-4">
								<div
									class="flex size-9 items-center justify-center rounded-lg bg-success text-success-content"
								>
									✓
								</div>

								<div class="flex-1">
									<p class="text-xs text-base-content/50">New booking</p>
									<p class="font-semibold">Court 2 · 7:00 PM</p>
								</div>

								<span class="badge badge-success badge-sm">Booked</span>
							</div>

							<div class="flex items-center gap-3 rounded-xl bg-base-200 p-4">
								<div
									class="flex size-9 items-center justify-center rounded-lg bg-primary text-primary-content"
								>
									✓
								</div>

								<div class="flex-1">
									<p class="text-xs text-base-content/50">Customer</p>
									<p class="font-semibold">Booked themselves</p>
								</div>
							</div>

							<div class="alert border border-success/20 bg-success/5 text-sm">
								<span>✨</span>
								<span>Your schedule stays up to date automatically.</span>
							</div>
						</div>
					</div>
				</div>
			</div>
		</div>
	</section>

	<!-- HOW IT WORKS -->
	<section id="how-it-works" class="bg-neutral py-24 text-neutral-content">
		<div class="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
			<div class="grid gap-14 lg:grid-cols-[0.8fr_1.2fr] lg:items-center">
				<div>
					<p class="font-bold uppercase tracking-widest text-primary-content/70">
						How it works
					</p>

					<h2 class="mt-3 text-4xl font-black tracking-tight sm:text-5xl">
						You set it up.<br />
						They do the booking.
					</h2>

					<p class="mt-6 max-w-lg text-lg leading-8 text-neutral-content/60">
						BookToGo takes care of the repetitive part of booking so
						you can focus on the actual business.
					</p>
				</div>

				<div class="space-y-4">
					{#each steps as step}
						<div
							class="group flex gap-5 rounded-2xl border border-neutral-content/10 bg-neutral-content/5 p-6 transition hover:bg-neutral-content/10"
						>
							<div class="font-mono text-sm font-bold text-primary-content/50">
								{step.number}
							</div>

							<div>
								<h3 class="text-xl font-bold">{step.title}</h3>

								<p class="mt-2 max-w-lg leading-7 text-neutral-content/55">
									{step.text}
								</p>
							</div>
						</div>
					{/each}
				</div>
			</div>
		</div>
	</section>

	<!-- OWNER DASHBOARD -->
	<section class="py-24">
		<div class="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
			<div class="grid items-center gap-14 lg:grid-cols-2">
				<!-- Dashboard mockup -->
				<div class="order-2 lg:order-1">
					<div class="rounded-3xl border border-base-300 bg-base-200 p-3 shadow-2xl">
						<div class="rounded-2xl bg-base-100 p-5">
							<div class="flex items-center justify-between">
								<div>
									<p class="text-xs font-medium text-base-content/50">
										Tuesday, September 2
									</p>

									<h3 class="mt-1 text-2xl font-black">Today's bookings</h3>
								</div>

								<div class="btn btn-primary btn-sm">+ Add booking</div>
							</div>

							<div class="mt-6 grid grid-cols-3 gap-3">
								<div class="stat rounded-xl bg-base-200 p-3">
									<div class="stat-title text-[10px]">Bookings</div>
									<div class="stat-value text-2xl">18</div>
								</div>

								<div class="stat rounded-xl bg-base-200 p-3">
									<div class="stat-title text-[10px]">Available</div>
									<div class="stat-value text-2xl">7</div>
								</div>

								<div class="stat rounded-xl bg-base-200 p-3">
									<div class="stat-title text-[10px]">Courts</div>
									<div class="stat-value text-2xl">6</div>
								</div>
							</div>

							<div class="mt-6 space-y-2">
								{#each [
									['5:00 PM', 'Court 1', 'Booked'],
									['6:00 PM', 'Court 2', 'Booked'],
									['7:00 PM', 'Court 1', 'Available'],
									['7:00 PM', 'Court 3', 'Booked'],
									['8:00 PM', 'Court 2', 'Available']
								] as booking}
									<div
										class="flex items-center gap-4 rounded-xl border border-base-300 p-3"
									>
										<div class="w-16 text-sm font-bold">{booking[0]}</div>

										<div class="h-8 w-px bg-base-300"></div>

										<div class="flex-1">
											<p class="font-semibold">{booking[1]}</p>
										</div>

										<div
											class:badge-success={booking[2] === 'Booked'}
											class:badge-ghost={booking[2] === 'Available'}
											class="badge badge-sm"
										>
											{booking[2]}
										</div>
									</div>
								{/each}
							</div>
						</div>
					</div>
				</div>

				<!-- Copy -->
				<div class="order-1 lg:order-2">
					<p class="font-bold uppercase tracking-widest text-primary">
						Your venue. Your rules.
					</p>

					<h2 class="mt-3 text-4xl font-black tracking-tight sm:text-5xl">
						Everything you need.<br />
						Nothing you don't.
					</h2>

					<p class="mt-6 text-lg leading-8 text-base-content/60">
						Manage your venue without learning some enormous piece of
						enterprise software.
					</p>

					<div class="mt-8 space-y-4">
						{#each [
							['Availability', 'Control exactly when your courts can be booked.'],
							['Pricing', 'Set and update your prices whenever you need.'],
							['Closures', 'Block out courts for maintenance, events or holidays.'],
							['Bookings', 'See what is booked and what is still available at a glance.']
						] as feature}
							<div class="flex gap-4">
								<div
									class="mt-1 flex size-6 shrink-0 items-center justify-center rounded-full bg-primary text-primary-content"
								>
									✓
								</div>

								<div>
									<h3 class="font-bold">{feature[0]}</h3>
									<p class="mt-1 text-sm leading-6 text-base-content/55">
										{feature[1]}
									</p>
								</div>
							</div>
						{/each}
					</div>
				</div>
			</div>
		</div>
	</section>

	<!-- CUSTOMER EXPERIENCE -->
	<section class="bg-base-200/60 py-24">
		<div class="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
			<div class="grid items-center gap-14 lg:grid-cols-2">
				<div>
					<p class="font-bold uppercase tracking-widest text-secondary">
						Better for customers
					</p>

					<h2 class="mt-3 text-4xl font-black tracking-tight sm:text-5xl">
						No calls.<br />
						No waiting.<br />
						Just book.
					</h2>

					<p class="mt-6 max-w-xl text-lg leading-8 text-base-content/60">
						Your customers already know what they want.
						Give them a fast way to find an available time and book it.
					</p>

					<div class="mt-8">
						<div class="alert border border-secondary/20 bg-secondary/5">
							<span class="text-xl">💡</span>

							<span>
								<strong>The result:</strong> customers get convenience
								while you get fewer messages.
							</span>
						</div>
					</div>
				</div>

				<div class="flex justify-center">
					<div class="mockup-phone border-base-300 bg-neutral">
						<div class="mockup-phone-camera"></div>

						<div class="display bg-base-100">
							<div class="artboard artboard-demo w-80 bg-base-100">
								<div class="w-full p-5">
									<div class="flex items-center gap-3">
										<div
											class="flex size-10 items-center justify-center rounded-xl bg-secondary"
										>
											🏸
										</div>

										<div>
											<p class="font-bold">Sunrise Badminton</p>
											<p class="text-xs text-base-content/50">Book a court</p>
										</div>
									</div>

									<div class="divider"></div>

									<p
										class="text-xs font-bold uppercase tracking-wider text-base-content/45"
									>
										Today
									</p>

									<div class="mt-3 grid grid-cols-2 gap-2">
										<div class="btn btn-outline btn-sm">5:00 PM</div>
										<div class="btn btn-outline btn-sm">6:00 PM</div>
										<div class="btn btn-primary btn-sm">7:00 PM</div>
										<div class="btn btn-outline btn-sm">8:00 PM</div>
									</div>

									<div class="mt-5 rounded-xl bg-base-200 p-4">
										<p class="text-xs text-base-content/50">Selected</p>
										<p class="mt-1 font-bold">Court 2 · 7:00 PM</p>

										<button class="btn btn-secondary btn-sm mt-4 w-full">
											Continue
										</button>
									</div>
								</div>
							</div>
						</div>
					</div>
				</div>
			</div>
		</div>
	</section>

	<!-- PAYMENTS -->
	<section class="py-24">
		<div class="mx-auto max-w-5xl px-4 sm:px-6 lg:px-8">
			<div
				class="relative overflow-hidden rounded-[2rem] border border-primary/20 bg-primary/5 p-8 sm:p-12"
			>
				<div
					class="absolute -right-20 -top-20 size-64 rounded-full bg-primary/10 blur-3xl"
				></div>

				<div class="relative grid gap-10 md:grid-cols-[1fr_auto] md:items-center">
					<div>
						<div class="badge badge-primary mb-5">Coming soon</div>

						<h2 class="text-3xl font-black tracking-tight sm:text-4xl">
							Book. Pay. Confirmed.
						</h2>

						<p class="mt-4 max-w-2xl text-lg leading-8 text-base-content/60">
							Online payments are coming to BookToGo, giving venues another
							way to reduce ghost bookings and no-shows.
						</p>
					</div>

					<div class="flex items-center justify-center">
						<div class="flex items-center gap-2 text-sm font-bold">
							<div class="badge badge-lg">Book</div>
							<span class="text-primary">→</span>
							<div class="badge badge-lg">Pay</div>
							<span class="text-primary">→</span>
							<div class="badge badge-primary badge-lg">Confirmed</div>
						</div>
					</div>
				</div>
			</div>
		</div>
	</section>

	<!-- FINAL CTA / CONTACT FORM -->
	<section id="get-started" class="pb-24">
		<div class="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
			<div
				class="hero overflow-hidden rounded-[2rem] bg-neutral py-20 text-neutral-content shadow-2xl sm:py-28"
			>
				<div class="hero-content px-6">
					<div class="grid w-full max-w-4xl gap-12 lg:grid-cols-2 lg:items-center">
						<!-- Copy -->
						<div class="text-center lg:text-left">
							<p class="font-bold uppercase tracking-widest text-primary-content/60">
								Ready to simplify your bookings?
							</p>

							<h2 class="mt-4 text-4xl font-black tracking-tight sm:text-5xl">
								Let your customers do the booking.
							</h2>

							<p class="mt-6 max-w-xl text-lg leading-8 text-neutral-content/60">
								Leave your details and we'll get in touch to set up
								BookToGo for your venue.
							</p>
						</div>

						<!-- Contact form -->
						<div class="card bg-base-100 text-base-content shadow-xl">
							<div class="card-body">
								{#if submitState === 'success'}
									<div class="alert border border-success/20 bg-success/5">
										<span class="text-xl">✅</span>
										<span>
											Thanks! We've got your details and will be in touch soon.
										</span>
									</div>
								{:else}
									<form class="space-y-4" on:submit={handleContactSubmit} novalidate>
										<div class="form-control">
											<label class="label" for="contact-name">
												<span class="label-text font-semibold">Name</span>
											</label>
											<input
												id="contact-name"
												type="text"
												name="name"
												autocomplete="name"
												placeholder="Your name"
												class="input input-bordered w-full"
												bind:value={contactName}
												disabled={submitState === 'submitting'}
											/>
										</div>

										<div class="form-control">
											<label class="label" for="contact-email">
												<span class="label-text font-semibold">Email</span>
											</label>
											<input
												id="contact-email"
												type="email"
												name="email"
												autocomplete="email"
												placeholder="you@example.com"
												class="input input-bordered w-full"
												bind:value={contactEmail}
												disabled={submitState === 'submitting'}
											/>
										</div>

										<div class="form-control">
											<label class="label" for="contact-phone">
												<span class="label-text font-semibold">Phone number</span>
											</label>
											<input
												id="contact-phone"
												type="tel"
												name="phone"
												autocomplete="tel"
												placeholder="07X XXX XXXX"
												class="input input-bordered w-full"
												bind:value={contactPhone}
												disabled={submitState === 'submitting'}
											/>
										</div>

										{#if errorMessage}
											<div class="alert border border-error/20 bg-error/5 text-sm">
												<span>⚠️</span>
												<span>{errorMessage}</span>
											</div>
										{/if}

										<button
											type="submit"
											class="btn btn-primary btn-lg w-full"
											disabled={submitState === 'submitting'}
										>
											{#if submitState === 'submitting'}
												<span class="loading loading-spinner"></span>
												Sending...
											{:else}
												Contact Us
											{/if}
										</button>
									</form>
								{/if}
							</div>
						</div>
					</div>
				</div>
			</div>
		</div>
	</section>

	<!-- FOOTER -->
		<!-- FOOTER -->
	<footer class="border-t border-base-300">
		<div
			class="mx-auto flex max-w-7xl flex-col gap-4 px-4 py-8 sm:flex-row sm:items-center sm:justify-between sm:px-6 lg:px-8"
		>
			<div class="flex items-center gap-2">
				<div
					class="flex size-8 items-center justify-center rounded-lg text-primary-content"
				>
				<img src="/logo.png" alt="BookToGo" />	
				</div>

				<span class="font-bold">BookToGo</span>
			</div>

			<nav class="flex items-center gap-6 text-sm text-base-content/60">
				<a href="/privacy-policy" class="hover:text-base-content">Privacy Policy</a>
				<a href="/contact" class="hover:text-base-content">Contact</a>
			</nav>

			<p class="text-sm text-base-content/45">
				© {new Date().getFullYear()} BookToGo. Book less. Manage better.
			</p>
		</div>
	</footer>
</div>