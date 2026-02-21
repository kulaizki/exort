<script lang="ts">
	import Chart from './Chart.svelte';

	interface TrendPoint {
		date: string;
		accuracy: number;
	}

	interface Props {
		trends: TrendPoint[];
	}

	let { trends }: Props = $props();

	const data = $derived({
		labels: trends.map((t) => new Date(t.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })),
		datasets: [
			{
				label: 'Accuracy',
				data: trends.map((t) => t.accuracy),
				borderColor: '#FFB800',
				backgroundColor: 'rgba(255, 184, 0, 0.1)',
				fill: true,
				tension: 0.3,
				pointRadius: 2,
				pointHoverRadius: 5,
				pointBackgroundColor: '#FFB800'
			}
		]
	});

	const options = {
		scales: {
			y: {
				min: 0,
				max: 100,
				ticks: { callback: (v: number | string) => `${v}%` }
			}
		},
		plugins: {
			legend: { display: false },
			tooltip: {
				callbacks: {
					label: (ctx: any) => `Accuracy: ${ctx.parsed.y.toFixed(1)}%`
				}
			}
		}
	};
</script>

<Chart type="line" {data} {options} class="h-64" />
