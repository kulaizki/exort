<script lang="ts">
	import { enhance } from '$app/forms';
	import { ChessboardBg } from '$lib/components';

	type Props = {
		form: { message?: string } | null;
	};

	let { form }: Props = $props();
	let chessboard: ReturnType<typeof ChessboardBg>;
</script>

<!-- svelte-ignore a11y_no_static_element_interactions -->
<div
	class="relative flex min-h-screen items-center justify-center bg-neutral-950 px-4"
	onmousemove={(e) => chessboard?.trackMouse(e)}
	onmouseleave={() => chessboard?.clearMouse()}
>
	<div class="pointer-events-none absolute inset-0">
		<ChessboardBg bind:this={chessboard} />
	</div>

	<a
		href="/"
		class="fixed top-6 left-6 z-10 flex items-center gap-1.5 text-sm text-neutral-400 transition-colors hover:text-neutral-200"
	>
		<svg
			xmlns="http://www.w3.org/2000/svg"
			class="h-4 w-4"
			viewBox="0 0 20 20"
			fill="currentColor"
		>
			<path
				fill-rule="evenodd"
				d="M9.707 16.707a1 1 0 01-1.414 0l-6-6a1 1 0 010-1.414l6-6a1 1 0 011.414 1.414L5.414 9H17a1 1 0 110 2H5.414l4.293 4.293a1 1 0 010 1.414z"
				clip-rule="evenodd"
			/>
		</svg>
		Back
	</a>

	<div class="relative w-full max-w-sm">
		<div class="mb-8 flex items-center justify-center gap-2">
			<img src="/exort-logo.svg" alt="" class="h-7 w-auto" />
			<span class="font-logo text-lg font-bold text-neutral-200">exort</span>
		</div>

		<div class="rounded-sm border border-neutral-800 bg-neutral-900 p-6">
			<h1 class="mb-6 text-center text-xl font-semibold text-neutral-200">
				Sign in to your account
			</h1>

			{#if form?.message}
				<div class="mb-4 rounded-sm border border-red-500/20 bg-red-500/10 px-4 py-2.5 text-sm text-red-400">
					{form.message}
				</div>
			{/if}

			<form method="post" use:enhance class="space-y-4">
				<div>
					<label for="email" class="mb-1.5 block text-sm font-medium text-neutral-200">
						Email
					</label>
					<input
						id="email"
						type="email"
						name="email"
						required
						placeholder="you@example.com"
						class="w-full rounded-sm border border-neutral-700 bg-neutral-800 px-4 py-2.5 text-sm text-neutral-200 placeholder-neutral-400 focus:border-gold focus:outline-none"
					/>
				</div>

				<div>
					<label for="password" class="mb-1.5 block text-sm font-medium text-neutral-200">
						Password
					</label>
					<input
						id="password"
						type="password"
						name="password"
						required
						placeholder="Enter your password"
						class="w-full rounded-sm border border-neutral-700 bg-neutral-800 px-4 py-2.5 text-sm text-neutral-200 placeholder-neutral-400 focus:border-gold focus:outline-none"
					/>
				</div>

				<button
					type="submit"
					class="w-full rounded-sm bg-gold px-4 py-2.5 text-sm font-semibold text-neutral-950 transition-colors hover:bg-gold-light"
				>
					Sign In
				</button>
			</form>
		</div>

		<p class="mt-6 text-center text-sm text-neutral-400">
			Don't have an account?
			<a href="/register" class="text-gold transition-colors hover:text-gold-light">Sign up</a>
		</p>
	</div>
</div>
