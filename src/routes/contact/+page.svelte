<script lang="ts">
	import Seo from "$lib/adminAssets/Seo.svelte";

	let contactName = '';
	let contactEmail = '';
	let contactPhone = '';

	let submitState: 'idle' | 'submitting' | 'success' = 'idle';
	let errorMessage = '';

	async function handleContactSubmit(event: SubmitEvent) {
		event.preventDefault();

		submitState = 'submitting';
		errorMessage = '';
		
		try {
			const response = await fetch('/api/v1/contact', {
				method: 'POST',
				headers: {
					'Content-Type': 'application/json'
				},
				body: JSON.stringify({
					contactName,
					contactEmail,
					contactPhone,
				})
			});

			const result = await response.json();

			if (!response.ok) {
				throw new Error(result.error || 'Something went wrong.');
			}

			submitState = 'success';
		} catch (error) {
			errorMessage = error instanceof Error
				? error.message
				: 'Something went wrong. Please try again.';
			submitState = 'idle';
		}
	}
</script>

<Seo image={'https://booktogo.lk/logo.png'} title={'BookToGo | Support'} description={'Have questions or want to add your venue to BookToGo? Contact us here.'} url={'https://booktogo.lk/contact' }/>
<div class="min-h-screen bg-base-100">
	<!-- Hero -->
	<section class="border-b border-base-200 bg-base-200/40">
		<div class="container mx-auto max-w-7xl px-4 py-20 sm:py-24">
			<div class="max-w-3xl">
				<div class="badge badge-primary badge-outline mb-5">
					BookToGo Support
				</div>

				<h1 class="text-4xl font-bold tracking-tight sm:text-5xl lg:text-6xl">
					Let’s get your venue
					<span class="text-primary"> online.</span>
				</h1>

				<p class="mt-6 max-w-2xl text-lg leading-relaxed text-base-content/70 sm:text-xl">
					Whether you're looking to bring your venue onto BookToGo, need help with your
					account, or simply have a question, our team is here to help.
				</p>
			</div>
		</div>
	</section>

	<!-- Main Contact Area -->
	<section class="container mx-auto max-w-7xl px-4 py-16 sm:py-20">
		<div class="grid gap-12 lg:grid-cols-[0.85fr_1.15fr] lg:items-start">
			<!-- Left Information -->
			<div>
				<p class="text-sm font-semibold uppercase tracking-wider text-primary">
					Get in touch
				</p>

				<h2 class="mt-3 text-3xl font-bold tracking-tight sm:text-4xl">
					How can we help?
				</h2>

				<p class="mt-4 leading-relaxed text-base-content/65">
					Send us your details and a member of the BookToGo team will get back to you.
					For venue owners, we can also help you understand how BookToGo can fit into
					your existing booking process.
				</p>

				<!-- Contact Details -->
				<div class="mt-10 space-y-6">
					<div class="flex gap-4">
						<div
							class="flex h-11 w-11 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary"
						>
							<svg
								xmlns="http://www.w3.org/2000/svg"
								class="h-5 w-5"
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
						</div>

						<div>
							<h3 class="font-semibold">Email support</h3>
							<p class="mt-1 text-sm text-base-content/60">
								For general enquiries and support requests.
							</p>
							<a
								href="mailto:reghvieabdullah@gmail.com"
								class="mt-2 inline-block text-sm font-medium text-primary hover:underline"
							>
								reghvieabdullah@gmail.com
							</a>
						</div>
					</div>

					<div class="flex gap-4">
						<div
							class="flex h-11 w-11 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary"
						>
							<svg
								xmlns="http://www.w3.org/2000/svg"
								class="h-5 w-5"
								fill="none"
								viewBox="0 0 24 24"
								stroke="currentColor"
							>
								<path
									stroke-linecap="round"
									stroke-linejoin="round"
									stroke-width="2"
									d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
								/>
							</svg>
						</div>

						<div>
							<h3 class="font-semibold">Response time</h3>
							<p class="mt-1 text-sm leading-relaxed text-base-content/60">
								We aim to respond to enquiries as soon as possible during
								our normal support hours.
							</p>
						</div>
					</div>

					<div class="flex gap-4">
						<div
							class="flex h-11 w-11 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary"
						>
							<svg
								xmlns="http://www.w3.org/2000/svg"
								class="h-5 w-5"
								fill="none"
								viewBox="0 0 24 24"
								stroke="currentColor"
							>
								<path
									stroke-linecap="round"
									stroke-linejoin="round"
									stroke-width="2"
									d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"
								/>
							</svg>
						</div>

						<div>
							<h3 class="font-semibold">For venue owners</h3>
							<p class="mt-1 text-sm leading-relaxed text-base-content/60">
								Interested in listing your venue? Tell us a little about
								your business and we'll take it from there.
							</p>
						</div>
					</div>
				</div>

				<!-- Trust Note -->
				<div class="mt-10 rounded-xl border border-base-300 bg-base-200/50 p-5">
					<div class="flex gap-3">
						<svg
							xmlns="http://www.w3.org/2000/svg"
							class="mt-0.5 h-5 w-5 shrink-0 text-primary"
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

						<div>
							<p class="text-sm font-semibold">Your information is kept private.</p>
							<p class="mt-1 text-xs leading-relaxed text-base-content/60">
								We only use the information you provide to respond to your enquiry
								and provide relevant support.
							</p>
						</div>
					</div>
				</div>
			</div>

			<!-- Contact Form -->
			<div class="card border border-base-200 bg-base-100 shadow-lg">
				<div class="card-body p-6 sm:p-8">
					{#if submitState === 'success'}
						<div class="flex min-h-[400px] flex-col items-center justify-center text-center">
							<div
								class="flex h-16 w-16 items-center justify-center rounded-full bg-success/10 text-3xl"
							>
								✓
							</div>

							<h2 class="mt-6 text-2xl font-bold">Message received</h2>

							<p class="mt-3 max-w-md leading-relaxed text-base-content/65">
								Thanks for reaching out to BookToGo. We've received your
								details and will get back to you as soon as possible.
							</p>
						</div>
					{:else}
						<div class="mb-7">
							<h2 class="text-2xl font-bold">Contact our team</h2>
							<p class="mt-2 text-sm text-base-content/60">
								Fill in the form below and we'll be in touch.
							</p>
						</div>

						<form class="space-y-5" on:submit={handleContactSubmit} novalidate>
							<div class="form-control">
								<label class="label" for="contact-name">
									<span class="label-text font-semibold">Full name</span>
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
									<span class="label-text font-semibold">Email address</span>
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
									<span class="label-text-alt text-base-content/50">Optional</span>
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
									<svg
										xmlns="http://www.w3.org/2000/svg"
										class="h-5 w-5 shrink-0"
										fill="none"
										viewBox="0 0 24 24"
										stroke="currentColor"
									>
										<path
											stroke-linecap="round"
											stroke-linejoin="round"
											stroke-width="2"
											d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
										/>
									</svg>

									<span>{errorMessage}</span>
								</div>
							{/if}

							<button
								type="submit"
								class="btn btn-primary btn-lg mt-2 w-full"
								disabled={submitState === 'submitting'}
							>
								{#if submitState === 'submitting'}
									<span class="loading loading-spinner"></span>
									Sending...
								{:else}
									Send enquiry
									<svg
										xmlns="http://www.w3.org/2000/svg"
										class="h-5 w-5"
										fill="none"
										viewBox="0 0 24 24"
										stroke="currentColor"
									>
										<path
											stroke-linecap="round"
											stroke-linejoin="round"
											stroke-width="2"
											d="M14 5l7 7m0 0l-7 7m7-7H3"
										/>
									</svg>
								{/if}
							</button>

							<p class="text-center text-xs leading-relaxed text-base-content/50">
								By submitting this form, you agree that BookToGo may contact you
								regarding your enquiry.
							</p>
						</form>
					{/if}
				</div>
			</div>
		</div>
	</section>

	<!-- What We Help With -->
	<section class="border-y border-base-200 bg-base-200/30">
		<div class="container mx-auto max-w-7xl px-4 py-16 sm:py-20">
			<div class="mx-auto max-w-2xl text-center">
				<p class="text-sm font-semibold uppercase tracking-wider text-primary">
					Support & enquiries
				</p>

				<h2 class="mt-3 text-3xl font-bold tracking-tight">
					Whatever you need, start here.
				</h2>

				<p class="mt-4 text-base-content/60">
					Our team can help with both venue operations and customer booking enquiries.
				</p>
			</div>

			<div class="mt-12 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
				<div class="rounded-xl border border-base-200 bg-base-100 p-6">
					<div class="text-2xl">🏢</div>
					<h3 class="mt-4 font-semibold">Venue onboarding</h3>
					<p class="mt-2 text-sm leading-relaxed text-base-content/60">
						Interested in bringing your sports venue or facility onto BookToGo?
					</p>
				</div>

				<div class="rounded-xl border border-base-200 bg-base-100 p-6">
					<div class="text-2xl">📅</div>
					<h3 class="mt-4 font-semibold">Booking support</h3>
					<p class="mt-2 text-sm leading-relaxed text-base-content/60">
						Questions about making, changing, or managing a booking?
					</p>
				</div>

				<div class="rounded-xl border border-base-200 bg-base-100 p-6">
					<div class="text-2xl">⚙️</div>
					<h3 class="mt-4 font-semibold">Technical support</h3>
					<p class="mt-2 text-sm leading-relaxed text-base-content/60">
						Experiencing an issue with your account, dashboard, or booking?
					</p>
				</div>

				<div class="rounded-xl border border-base-200 bg-base-100 p-6">
					<div class="text-2xl">💡</div>
					<h3 class="mt-4 font-semibold">Feedback & suggestions</h3>
					<p class="mt-2 text-sm leading-relaxed text-base-content/60">
						Have an idea that could make BookToGo better?
					</p>
				</div>

				<div class="rounded-xl border border-base-200 bg-base-100 p-6">
					<div class="text-2xl">🤝</div>
					<h3 class="mt-4 font-semibold">Partnerships</h3>
					<p class="mt-2 text-sm leading-relaxed text-base-content/60">
						Interested in working with BookToGo or integrating with our platform?
					</p>
				</div>

				<div class="rounded-xl border border-base-200 bg-base-100 p-6">
					<div class="text-2xl">❓</div>
					<h3 class="mt-4 font-semibold">General enquiries</h3>
					<p class="mt-2 text-sm leading-relaxed text-base-content/60">
						Not sure where your question fits? Just send us a message.
					</p>
				</div>
			</div>
		</div>
	</section>

	<!-- FAQ -->
	<section class="container mx-auto max-w-4xl px-4 py-16 sm:py-20">
		<div class="text-center">
			<p class="text-sm font-semibold uppercase tracking-wider text-primary">
				FAQ
			</p>

			<h2 class="mt-3 text-3xl font-bold tracking-tight">
				Common questions
			</h2>
		</div>

		<div class="mt-10 space-y-3">
			<div class="collapse collapse-arrow border border-base-200 bg-base-100">
				<input type="radio" name="contact-faq" checked="checked" />

				<div class="collapse-title font-semibold">
					How do I book a venue?
				</div>

				<div class="collapse-content text-sm leading-relaxed text-base-content/65">
					Choose a venue on BookToGo, select the court or facility you want,
					pick an available date and time, and complete your booking.
				</div>
			</div>

			<div class="collapse collapse-arrow border border-base-200 bg-base-100">
				<input type="radio" name="contact-faq" />

				<div class="collapse-title font-semibold">
					How can I list my venue on BookToGo?
				</div>

				<div class="collapse-content text-sm leading-relaxed text-base-content/65">
					Submit the contact form above and let us know that you're interested
					in joining BookToGo. Our team will get in touch with you about the
					onboarding process.
				</div>
			</div>

			<div class="collapse collapse-arrow border border-base-200 bg-base-100">
				<input type="radio" name="contact-faq" />

				<div class="collapse-title font-semibold">
					I have an issue with an existing booking. What should I do?
				</div>

				<div class="collapse-content text-sm leading-relaxed text-base-content/65">
					Contact us using the form above and include the relevant booking
					details where possible. This helps us investigate the issue faster.
				</div>
			</div>

			<div class="collapse collapse-arrow border border-base-200 bg-base-100">
				<input type="radio" name="contact-faq" />

				<div class="collapse-title font-semibold">
					Can I contact BookToGo about a partnership?
				</div>

				<div class="collapse-content text-sm leading-relaxed text-base-content/65">
					Absolutely. Select the contact form and provide some information about
					your organisation and what you'd like to work on together.
				</div>
			</div>
		</div>
	</section>

	<!-- Final CTA -->
	<section class="container mx-auto max-w-7xl px-4 pb-16 sm:pb-20">
		<div class="overflow-hidden rounded-2xl bg-primary text-primary-content">
			<div class="px-6 py-12 text-center sm:px-12 sm:py-16">
				<h2 class="text-3xl font-bold sm:text-4xl">
					Ready to get started?
				</h2>

				<p class="mx-auto mt-4 max-w-2xl text-primary-content/80">
					Whether you're a venue owner looking to simplify bookings or a customer
					who needs help, we're here to make the process easier.
				</p>

				<a href="#contact-name" class="btn btn-neutral mt-8">
					Contact BookToGo
				</a>
			</div>
		</div>
	</section>
</div>

<style>
	:global(html) {
		scroll-behavior: smooth;
	}
</style>
