<script lang="ts">
	import Chart from './Chart.svelte';

	interface Props {
		byTimeControl: Record<string, { games: number; accuracy: number; avgCpl: number }>;
	}

	let { byTimeControl }: Props = $props();

	const entries = $derived(
		Object.entries(byTimeControl).sort(([, a], [, b]) => b.games - a.games)
	);

	const data = $derived({
		labels: entries.map(([tc]) => tc),
		datasets: [
			{
				label: 'Accuracy',
				data: entries.map(([, stats]) => stats.accuracy),
				backgroundColor: '#FFB800',
				borderRadius: 4
			}
		]
	});

	const options = {
		indexAxis: 'y' as const,
		scales: {
			x: {
				min: 0,
				max: 100,
				ticks: { callback: (v: number | string) => `${v}%` }
			}
		},
		plugins: {
			legend: { display: false },
			tooltip: {
				callbacks: {
					label: (ctx: any) => {
						const tc = entries[ctx.dataIndex];
						return `${tc[1].accuracy.toFixed(1)}% accuracy (${tc[1].games} games)`;
					}
				}
			}
		}
	};
</script>

<Chart type="bar" {data} {options} class="h-64" />
