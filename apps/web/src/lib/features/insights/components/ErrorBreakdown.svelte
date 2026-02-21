<script lang="ts">
	import Chart from './Chart.svelte';

	interface TrendPoint {
		date: string;
		blunders: number;
		mistakes: number;
		inaccuracies: number;
	}

	interface Props {
		trends: TrendPoint[];
	}

	let { trends }: Props = $props();

	const recent = $derived(trends.slice(-20));

	const data = $derived({
		labels: recent.map((_, i) => `G${i + 1}`),
		datasets: [
			{
				label: 'Blunders',
				data: recent.map((t) => t.blunders),
				backgroundColor: '#F87171'
			},
			{
				label: 'Mistakes',
				data: recent.map((t) => t.mistakes),
				backgroundColor: '#FB923C'
			},
			{
				label: 'Inaccuracies',
				data: recent.map((t) => t.inaccuracies),
				backgroundColor: '#FBBF24'
			}
		]
	});

	const options = {
		scales: {
			x: { stacked: true },
			y: {
				stacked: true,
				beginAtZero: true,
				ticks: { stepSize: 1 }
			}
		},
		plugins: {
			legend: {
				position: 'bottom' as const,
				labels: { usePointStyle: true, pointStyle: 'rect' }
			}
		}
	};
</script>

<Chart type="bar" {data} {options} class="h-64" />
