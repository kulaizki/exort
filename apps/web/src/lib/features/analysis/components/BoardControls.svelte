<script lang="ts">
	interface Props {
		canGoBack: boolean;
		canGoForward: boolean;
		isPlaying: boolean;
		onFirst: () => void;
		onPrev: () => void;
		onNext: () => void;
		onLast: () => void;
		onFlip: () => void;
		onTogglePlay: () => void;
	}

	let { canGoBack, canGoForward, isPlaying, onFirst, onPrev, onNext, onLast, onFlip, onTogglePlay }: Props = $props();
</script>

<div class="flex items-center gap-1">
	<!-- Auto-play -->
	<button
		class="rounded-sm border border-neutral-800 bg-neutral-900 p-2 text-neutral-400 transition-colors hover:bg-neutral-800 hover:text-neutral-200 {isPlaying ? 'text-gold' : ''}"
		onclick={onTogglePlay}
		disabled={!canGoForward && !isPlaying}
		aria-label={isPlaying ? 'Pause auto-play' : 'Auto-play moves'}
	>
		{#if isPlaying}
			<svg class="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
				<rect x="6" y="4" width="4" height="16" />
				<rect x="14" y="4" width="4" height="16" />
			</svg>
		{:else}
			<svg class="h-4 w-4" viewBox="0 0 24 24" fill="currentColor">
				<polygon points="6 3 20 12 6 21 6 3" />
			</svg>
		{/if}
	</button>

	<!-- Divider -->
	<div class="mx-1 h-5 w-px bg-neutral-800"></div>

	<!-- First move -->
	<button
		class="rounded-sm border border-neutral-800 bg-neutral-900 p-2 text-neutral-400 transition-colors hover:bg-neutral-800 hover:text-neutral-200 disabled:cursor-not-allowed disabled:opacity-30"
		disabled={!canGoBack}
		onclick={onFirst}
		aria-label="Go to first move"
	>
		<svg class="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
			<line x1="7" y1="6" x2="7" y2="18" />
			<polyline points="17 6 11 12 17 18" />
		</svg>
	</button>

	<!-- Previous move -->
	<button
		class="rounded-sm border border-neutral-800 bg-neutral-900 p-2 text-neutral-400 transition-colors hover:bg-neutral-800 hover:text-neutral-200 disabled:cursor-not-allowed disabled:opacity-30"
		disabled={!canGoBack}
		onclick={onPrev}
		aria-label="Go to previous move"
	>
		<svg class="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
			<polyline points="15 6 9 12 15 18" />
		</svg>
	</button>

	<!-- Next move -->
	<button
		class="rounded-sm border border-neutral-800 bg-neutral-900 p-2 text-neutral-400 transition-colors hover:bg-neutral-800 hover:text-neutral-200 disabled:cursor-not-allowed disabled:opacity-30"
		disabled={!canGoForward}
		onclick={onNext}
		aria-label="Go to next move"
	>
		<svg class="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
			<polyline points="9 6 15 12 9 18" />
		</svg>
	</button>

	<!-- Last move -->
	<button
		class="rounded-sm border border-neutral-800 bg-neutral-900 p-2 text-neutral-400 transition-colors hover:bg-neutral-800 hover:text-neutral-200 disabled:cursor-not-allowed disabled:opacity-30"
		disabled={!canGoForward}
		onclick={onLast}
		aria-label="Go to last move"
	>
		<svg class="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
			<polyline points="7 6 13 12 7 18" />
			<line x1="17" y1="6" x2="17" y2="18" />
		</svg>
	</button>

	<!-- Divider -->
	<div class="mx-1 h-5 w-px bg-neutral-800"></div>

	<!-- Flip board -->
	<button
		class="rounded-sm border border-neutral-800 bg-neutral-900 p-2 text-neutral-400 transition-colors hover:bg-neutral-800 hover:text-neutral-200"
		onclick={onFlip}
		aria-label="Flip board"
	>
		<svg class="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
			<polyline points="1 4 1 10 7 10" />
			<polyline points="23 20 23 14 17 14" />
			<path d="M20.49 9A9 9 0 0 0 5.64 5.64L1 10" />
			<path d="M3.51 15A9 9 0 0 0 18.36 18.36L23 14" />
		</svg>
	</button>
</div>
