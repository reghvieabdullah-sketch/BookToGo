<script lang="ts">
	const problems = [
		{
			icon: '📞',
			title: 'Endless booking calls',
			text: 'Customers can see availability and book without calling you to ask what is free.'
		},
		{
			icon: '💬',
			title: 'WhatsApp chaos',
			text: 'Stop digging through conversations to figure out who booked what and when.'
		},
		{
			icon: '📅',
			title: 'Manual schedules',
			text: 'Manage courts, availability, pricing and bookings from one simple dashboard.'
		},
		{
			icon: '👻',
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
</script>

<svelte:head>
	<title>BookToGo — Let your customers book themselves</title>
	<meta
		name="description"
		content="BookToGo helps sports venues spend less time answering booking calls and messages, and more time running their venue."
	/>
</svelte:head>

<div class="bg-base-100 text-base-content">
	<!-- NAVBAR -->
	<header class="navbar mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-5">
		<div class="navbar-start">
			<a href="/" class="flex items-center gap-2">
				<div
					class="flex size-10 items-center justify-center rounded-xl bg-primary text-primary-content shadow-lg"
				>
					<svg
						xmlns="http://www.w3.org/2000/svg"
						viewBox="0 0 24 24"
						fill="none"
						stroke="currentColor"
						stroke-width="2"
						class="size-5"
					>
						<path d="M6 3h12" />
						<path d="M6 3v4a6 6 0 0 0 12 0V3" />
						<path d="M12 13v8" />
						<path d="M8 21h8" />
					</svg>
				</div>

				<span class="text-xl font-black tracking-tight">BookToGo</span>
			</a>
		</div>

		<div class="navbar-end gap-2">
			<a href="#how-it-works" class="btn btn-ghost hidden sm:inline-flex">
				How it works
			</a>

			<a href="#get-started" class="btn btn-primary">
				Get started
			</a>
		</div>
	</header>

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

					<h1 class="text-5xl font-black leading-[0.95] tracking-tight sm:text-6xl lg:text-7xl">
						Let your customers
						<span class="text-primary">book themselves.</span>
					</h1>

					<p class="mt-7 max-w-xl text-lg leading-8 text-base-content/65 sm:text-xl">
						Stop spending your day answering “Is 7 PM available?”
						BookToGo gives your customers an easy way to book while
						you get one simple place to manage it all.
					</p>

					<div class="mt-9 flex flex-col gap-3 sm:flex-row">
						<a href="#get-started" class="btn btn-primary btn-lg shadow-lg shadow-primary/20">
							Start accepting bookings
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

						<a href="#how-it-works" class="btn btn-ghost btn-lg">
							See how it works
						</a>
					</div>

					<div class="mt-8 flex flex-wrap gap-x-6 gap-y-2 text-sm text-base-content/50">
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

				<!-- Hero visual -->
				<div class="relative">
					<!-- Decorative background -->
					<div
						class="absolute -inset-8 -z-10 rounded-[4rem] bg-primary/5 blur-3xl"
					></div>

					<div class="mockup-browser border border-base-300 bg-base-200 shadow-2xl">
						<div class="mockup-browser-toolbar">
							<div class="input border-base-300 bg-base-100 text-xs">
								sunrisebadminton.booktogo.app
							</div>
						</div>

						<div class="bg-base-100 p-5 sm:p-7">
							<!-- Booking page header -->
							<div class="flex items-start justify-between gap-4">
								<div>
									<div class="flex items-center gap-3">
										<div
											class="flex size-11 items-center justify-center rounded-xl bg-secondary text-secondary-content"
										>
											🏸
										</div>

										<div>
											<h3 class="font-bold">Sunrise Badminton</h3>
											<p class="text-xs text-base-content/50">Colombo</p>
										</div>
									</div>
								</div>

								<div class="badge badge-success badge-sm gap-1">
									<span class="size-1.5 rounded-full bg-current"></span>
									Open
								</div>
							</div>

							<div class="divider my-5"></div>

							<div class="mb-4">
								<p class="text-xs font-semibold uppercase tracking-wider text-base-content/45">
									Choose a date
								</p>

								<div class="mt-3 flex gap-2 overflow-hidden">
									<div class="btn btn-primary btn-sm h-auto min-w-16 flex-col py-2">
										<span class="text-[10px] opacity-70">TODAY</span>
										<span>02</span>
									</div>

									<div class="btn btn-sm h-auto min-w-16 flex-col py-2">
										<span class="text-[10px] opacity-50">THU</span>
										<span>03</span>
									</div>

									<div class="btn btn-sm h-auto min-w-16 flex-col py-2">
										<span class="text-[10px] opacity-50">FRI</span>
										<span>04</span>
									</div>

									<div class="btn btn-sm h-auto min-w-16 flex-col py-2">
										<span class="text-[10px] opacity-50">SAT</span>
										<span>05</span>
									</div>
								</div>
							</div>

							<p class="mb-3 text-xs font-semibold uppercase tracking-wider text-base-content/45">
								Available times
							</p>

							<div class="grid grid-cols-2 gap-2 sm:grid-cols-3">
								<button class="btn btn-outline btn-sm">5:00 PM</button>
								<button class="btn btn-outline btn-sm">6:00 PM</button>
								<button class="btn btn-primary btn-sm">7:00 PM</button>
								<button class="btn btn-outline btn-sm">8:00 PM</button>
								<button class="btn btn-outline btn-sm">9:00 PM</button>
								<button class="btn btn-disabled btn-sm">10:00 PM</button>
							</div>

							<div class="mt-5 rounded-xl bg-base-200 p-4">
								<div class="flex items-center justify-between">
									<div>
										<p class="text-xs text-base-content/50">Court 2</p>
										<p class="font-bold">7:00 PM — 8:00 PM</p>
									</div>

									<div class="badge badge-primary">Available</div>
								</div>

								<button class="btn btn-primary btn-sm mt-4 w-full">
									Book this court
								</button>
							</div>
						</div>
					</div>

					<!-- Floating owner notification -->
					<div
						class="absolute -bottom-7 -left-4 hidden w-64 rounded-2xl border border-base-300 bg-base-100 p-4 shadow-xl sm:block lg:-left-10"
					>
						<div class="flex items-center gap-3">
							<div class="avatar placeholder">
								<div class="size-10 rounded-full bg-success text-success-content">
									<span>✓</span>
								</div>
							</div>

							<div>
								<p class="text-xs text-base-content/50">New booking</p>
								<p class="font-bold">Court 2 · 7:00 PM</p>
							</div>
						</div>
					</div>

					<!-- Floating notification -->
					<div
						class="absolute -right-3 -top-6 hidden rounded-2xl border border-base-300 bg-base-100 p-3 shadow-xl sm:flex sm:items-center sm:gap-3"
					>
						<div class="flex size-9 items-center justify-center rounded-full bg-primary/10">
							📅
						</div>

						<div>
							<p class="text-xs font-semibold">18 bookings today</p>
							<p class="text-[11px] text-base-content/45">Everything in one place</p>
						</div>
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
					<div class="card border border-base-300 bg-base-100 shadow-sm transition duration-300 hover:-translate-y-1 hover:shadow-lg">
						<div class="card-body">
							<div class="text-3xl">{problem.icon}</div>

							<h3 class="mt-2 text-lg font-bold">{problem.title}</h3>

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
								<div class="flex size-9 items-center justify-center rounded-lg bg-success text-success-content">
									✓
								</div>

								<div class="flex-1">
									<p class="text-xs text-base-content/50">New booking</p>
									<p class="font-semibold">Court 2 · 7:00 PM</p>
								</div>

								<span class="badge badge-success badge-sm">Booked</span>
							</div>

							<div class="flex items-center gap-3 rounded-xl bg-base-200 p-4">
								<div class="flex size-9 items-center justify-center rounded-lg bg-primary text-primary-content">
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
	<section id="how-it-works" class="bg-neutral text-neutral-content py-24">
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
									<p class="text-xs font-medium text-base-content/50">Tuesday, September 2</p>
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
									<div class="flex items-center gap-4 rounded-xl border border-base-300 p-3">
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
					<p class="font-bold uppercase tracking-widest text-primary">Your venue. Your rules.</p>

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
								<div class="mt-1 flex size-6 shrink-0 items-center justify-center rounded-full bg-primary text-primary-content">
									✓
								</div>

								<div>
									<h3 class="font-bold">{feature[0]}</h3>
									<p class="mt-1 text-sm leading-6 text-base-content/55">{feature[1]}</p>
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
					<p class="font-bold uppercase tracking-widest text-secondary">Better for customers</p>

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
										<div class="flex size-10 items-center justify-center rounded-xl bg-secondary">
											🏸
										</div>

										<div>
											<p class="font-bold">Sunrise Badminton</p>
											<p class="text-xs text-base-content/50">Book a court</p>
										</div>
									</div>

									<div class="divider"></div>

									<p class="text-xs font-bold uppercase tracking-wider text-base-content/45">
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
			<div class="relative overflow-hidden rounded-[2rem] border border-primary/20 bg-primary/5 p-8 sm:p-12">
				<div class="absolute -right-20 -top-20 size-64 rounded-full bg-primary/10 blur-3xl"></div>

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

	<!-- FINAL CTA -->
	<section id="get-started" class="pb-24">
		<div class="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
			<div class="hero overflow-hidden rounded-[2rem] bg-neutral py-20 text-neutral-content shadow-2xl sm:py-28">
				<div class="hero-content px-6 text-center">
					<div class="max-w-3xl">
						<p class="font-bold uppercase tracking-widest text-primary-content/60">
							Ready to simplify your bookings?
						</p>

						<h2 class="mt-4 text-4xl font-black tracking-tight sm:text-6xl">
							Let your customers do the booking.
						</h2>

						<p class="mx-auto mt-6 max-w-2xl text-lg leading-8 text-neutral-content/60">
							Spend less time answering calls and messages.
							Give your customers a better way to book your venue.
						</p>

						<div class="mt-9 flex flex-col justify-center gap-3 sm:flex-row">
							<a href="/signup" class="btn btn-primary btn-lg">
								Get started with BookToGo
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

							<a href="#how-it-works" class="btn btn-ghost btn-lg text-neutral-content">
								See how it works
							</a>
						</div>
					</div>
				</div>
			</div>
		</div>
	</section>

	<!-- FOOTER -->
	<footer class="border-t border-base-300">
		<div class="mx-auto flex max-w-7xl flex-col gap-4 px-4 py-8 sm:flex-row sm:items-center sm:justify-between sm:px-6 lg:px-8">
			<div class="flex items-center gap-2">
				<div class="flex size-8 items-center justify-center rounded-lg bg-primary text-primary-content">
					<svg
						xmlns="http://www.w3.org/2000/svg"
						viewBox="0 0 24 24"
						fill="none"
						stroke="currentColor"
						stroke-width="2"
						class="size-4"
					>
						<path d="M6 3h12" />
						<path d="M6 3v4a6 6 0 0 0 12 0V3" />
						<path d="M12 13v8" />
						<path d="M8 21h8" />
					</svg>
				</div>

				<span class="font-bold">BookToGo</span>
			</div>

			<p class="text-sm text-base-content/45">
				© {new Date().getFullYear()} BookToGo. Book less. Manage better.
			</p>
		</div>
	</footer>
</div>