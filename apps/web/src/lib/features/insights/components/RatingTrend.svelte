<script lang="ts">
	import Chart from './Chart.svelte';

	interface TrendPoint {
		date: string;
		playerRating: number | null;
		timeControl: string | null;
	}

	interface Props {
		trends: TrendPoint[];
	}

	let { trends }: Props = $props();

	const TC_COLORS: Record<string, { border: string; bg: string }> = {
		bullet: { border: '#F87171', bg: 'rgba(248, 113, 113, 0.08)' },
		blitz: { border: '#FFB800', bg: 'rgba(255, 184, 0, 0.08)' },
		rapid: { border: '#60A5FA', bg: 'rgba(96, 165, 250, 0.08)' },
		classical: { border: '#34D399', bg: 'rgba(52, 211, 153, 0.08)' }
	};
	const DEFAULT_COLOR = { border: '#9CA3AF', bg: 'rgba(156, 163, 175, 0.08)' };

	const grouped = $derived.by(() => {
		const map: Record<string, { date: string; rating: number }[]> = {};
		for (const t of trends) {
			if (t.playerRating == null || !t.timeControl) continue;
			const tc = t.timeControl;
			if (!map[tc]) map[tc] = [];
			map[tc].push({ date: t.date, rating: t.playerRating });
		}
		return map;
	});

	const timeControls = $derived(Object.keys(grouped).sort());
	const hasData = $derived(timeControls.length > 0);

	const data = $derived.by(() => {
		const datasets = timeControls.map((tc) => {
			const points = grouped[tc];
			const colors = TC_COLORS[tc] ?? DEFAULT_COLOR;
			return {
				label: tc.charAt(0).toUpperCase() + tc.slice(1),
				data: points.map((p) => ({ x: p.date, y: p.rating })),
				borderColor: colors.border,
				backgroundColor: colors.bg,
				fill: false,
				tension: 0.3,
				pointRadius: 2,
				pointHoverRadius: 5,
				pointBackgroundColor: colors.border
			};
		});
		return { datasets };
	});

	const options = {
		scales: {
			x: {
				type: 'time' as const,
				time: { unit: 'week' as const, tooltipFormat: 'MMM d, yyyy' },
				ticks: { maxTicksAutoSkip: true }
			}
		},
		plugins: {
			legend: {
				position: 'bottom' as const,
				labels: { usePointStyle: true, pointStyle: 'circle' }
			},
			tooltip: {
				callbacks: {
					label: (ctx: any) => `${ctx.dataset.label}: ${ctx.parsed.y}`
				}
			}
		}
	};
</script>

{#if hasData}
	<Chart type="line" {data} {options} class="h-56" />
{:else}
	<div class="flex h-56 items-center justify-center">
		<p class="text-sm text-neutral-500">No rating data available</p>
	</div>
{/if}
