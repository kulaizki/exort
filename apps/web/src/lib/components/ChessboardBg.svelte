<script lang="ts">
	import { onMount } from 'svelte';

	const TILE_SIZE = 60;
	const CURSOR_RADIUS = 220;
	const IDLE_DELAY = 800;
	const FADE_SPEED = 0.025;

	// Colors
	const DARK_TILE = [10, 10, 10] as const;    // #0A0A0A (bg)
	const LIGHT_TILE = [13, 13, 13] as const;   // barely visible
	const GOLD = [255, 184, 0] as const;         // #FFB800

	let canvas: HTMLCanvasElement;
	let ctx: CanvasRenderingContext2D;
	let cols = 0;
	let rows = 0;
	let mouseX = -1000;
	let mouseY = -1000;
	let activity = 0;
	let lastMoveTime = 0;
	let animationId: number;

	function resize() {
		const rect = canvas.parentElement!.getBoundingClientRect();
		canvas.width = rect.width;
		canvas.height = rect.height;
		cols = Math.ceil(canvas.width / TILE_SIZE) + 1;
		rows = Math.ceil(canvas.height / TILE_SIZE) + 1;
	}

	export function trackMouse(e: MouseEvent) {
		const rect = canvas.getBoundingClientRect();
		mouseX = e.clientX - rect.left;
		mouseY = e.clientY - rect.top;
		activity = 1;
		lastMoveTime = performance.now();
	}

	export function clearMouse() {
		mouseX = -1000;
		mouseY = -1000;
	}

	function animate() {
		ctx.clearRect(0, 0, canvas.width, canvas.height);

		if (performance.now() - lastMoveTime > IDLE_DELAY) {
			activity = Math.max(0, activity - FADE_SPEED);
		}

		for (let r = 0; r < rows; r++) {
			for (let c = 0; c < cols; c++) {
				const x = c * TILE_SIZE;
				const y = r * TILE_SIZE;
				const isLight = (r + c) % 2 === 0;

				// Distance from tile center to cursor
				const cx = x + TILE_SIZE / 2;
				const cy = y + TILE_SIZE / 2;
				const dx = mouseX - cx;
				const dy = mouseY - cy;
				const dist = Math.sqrt(dx * dx + dy * dy);
				const proximity = Math.max(0, 1 - dist / CURSOR_RADIUS) * activity;

				// Base tile color
				const base = isLight ? LIGHT_TILE : DARK_TILE;

				// Blend toward gold based on proximity
				const goldIntensity = proximity * proximity * 0.18;
				const red = Math.round(base[0] + (GOLD[0] - base[0]) * goldIntensity);
				const green = Math.round(base[1] + (GOLD[1] - base[1]) * goldIntensity);
				const blue = Math.round(base[2] + (GOLD[2] - base[2]) * goldIntensity);

				ctx.fillStyle = `rgb(${red}, ${green}, ${blue})`;
				ctx.fillRect(x, y, TILE_SIZE, TILE_SIZE);

				// Gold border on light tiles near cursor
				if (isLight && proximity > 0.2) {
					const borderAlpha = (proximity - 0.2) * 0.35;
					ctx.strokeStyle = `rgba(255, 184, 0, ${borderAlpha})`;
					ctx.lineWidth = 0.5;
					ctx.strokeRect(x + 0.5, y + 0.5, TILE_SIZE - 1, TILE_SIZE - 1);
				}
			}
		}

		animationId = requestAnimationFrame(animate);
	}

	onMount(() => {
		ctx = canvas.getContext('2d')!;
		resize();

		const observer = new ResizeObserver(resize);
		observer.observe(canvas.parentElement!);

		animationId = requestAnimationFrame(animate);

		return () => {
			cancelAnimationFrame(animationId);
			observer.disconnect();
		};
	});
</script>

<canvas
	bind:this={canvas}
	class="pointer-events-none absolute inset-0 h-full w-full"
></canvas>
