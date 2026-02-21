<script lang="ts">
	import Chart from './Chart.svelte';

	interface TrendPoint {
		date: string;
		playerRating: number | null;
	}

	interface Props {
		trends: TrendPoint[];
	}

	let { trends }: Props = $props();

	const rated = $derived(trends.filter((t) => t.playerRating != null));
	const hasData = $derived(rated.length > 0);

	const data = $derived({
		labels: rated.map((t) =>
			new Date(t.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
		),
		datasets: [
			{
				label: 'Rating',
				data: rated.map((t) => t.playerRating),
				borderColor: '#9CA3AF',
				backgroundColor: 'rgba(156, 163, 175, 0.08)',
				fill: true,
				tension: 0.3,
				pointRadius: 2,
				pointHoverRadius: 5,
				pointBackgroundColor: '#9CA3AF'
			}
		]
	});

	const options = {
		plugins: {
			legend: { display: false },
			tooltip: {
				callbacks: {
					label: (ctx: any) => `Rating: ${ctx.parsed.y}`
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
