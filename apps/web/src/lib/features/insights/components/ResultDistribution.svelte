<script lang="ts">
	import Chart from './Chart.svelte';

	interface Props {
		wins: number;
		losses: number;
		draws: number;
	}

	let { wins, losses, draws }: Props = $props();

	const total = $derived(wins + losses + draws);

	const data = $derived({
		labels: ['Wins', 'Losses', 'Draws'],
		datasets: [
			{
				data: [wins, losses, draws],
				backgroundColor: ['#4ADE80', '#F87171', '#6B7280'],
				borderWidth: 0,
				hoverOffset: 4
			}
		]
	});

	const options = {
		cutout: '65%',
		plugins: {
			legend: {
				position: 'bottom' as const,
				labels: { usePointStyle: true, pointStyle: 'circle' }
			},
			tooltip: {
				callbacks: {
					label: (ctx: any) => {
						const pct = total > 0 ? ((ctx.parsed / total) * 100).toFixed(1) : '0';
						return `${ctx.label}: ${ctx.parsed} (${pct}%)`;
					}
				}
			}
		}
	};
</script>

<Chart type="doughnut" {data} {options} class="h-64" />
