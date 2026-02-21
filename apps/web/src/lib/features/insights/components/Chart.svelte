<script lang="ts">
	import type { ChartType, ChartData, ChartOptions, Chart as ChartJS } from 'chart.js';

	interface Props {
		type: ChartType;
		data: ChartData;
		options?: ChartOptions;
		class?: string;
	}

	let { type, data, options = {}, class: className = '' }: Props = $props();

	let canvasEl: HTMLCanvasElement | undefined = $state();
	let chart: ChartJS | undefined = $state();

	const skipAxesTypes = ['doughnut', 'pie', 'polarArea'];

	function deepMerge(target: Record<string, any>, source: Record<string, any>): any {
		const result = { ...target };
		for (const key of Object.keys(source)) {
			if (
				source[key] &&
				typeof source[key] === 'object' &&
				!Array.isArray(source[key]) &&
				target[key] &&
				typeof target[key] === 'object'
			) {
				result[key] = deepMerge(target[key], source[key]);
			} else {
				result[key] = source[key];
			}
		}
		return result;
	}

	const computedOptions: ChartOptions = $derived.by(() => {
		const base: ChartOptions = {
			responsive: true,
			maintainAspectRatio: false,
			plugins: {
				legend: {
					labels: { color: '#9CA3AF' }
				},
				tooltip: {
					backgroundColor: '#1F1F1F',
					titleColor: '#E5E5E5',
					bodyColor: '#9CA3AF',
					borderColor: '#2E2E2E',
					borderWidth: 1
				}
			}
		};

		if (!skipAxesTypes.includes(type)) {
			base.scales = {
				x: {
					ticks: { color: '#9CA3AF' },
					grid: { color: '#2E2E2E' },
					border: { color: '#2E2E2E' }
				},
				y: {
					ticks: { color: '#9CA3AF' },
					grid: { color: '#2E2E2E' },
					border: { color: '#2E2E2E' }
				}
			};
		}

		return deepMerge(base, options);
	});

	// Mount Chart.js (SSR-safe via dynamic import)
	$effect(() => {
		if (!canvasEl) return;

		let destroyed = false;
		let localChart: ChartJS | undefined;

		import('chart.js').then(
			({
				Chart,
				CategoryScale,
				LinearScale,
				PointElement,
				LineElement,
				BarElement,
				ArcElement,
				Filler,
				Tooltip,
				Legend
			}) => {
				if (destroyed) return;

				Chart.register(
					CategoryScale,
					LinearScale,
					PointElement,
					LineElement,
					BarElement,
					ArcElement,
					Filler,
					Tooltip,
					Legend
				);

				localChart = new Chart(canvasEl!, {
					type,
					data,
					options: computedOptions
				});
				chart = localChart;
			}
		);

		return () => {
			destroyed = true;
			localChart?.destroy();
			chart = undefined;
		};
	});

	// Reactive data/options updates
	$effect(() => {
		if (!chart) return;
		chart.data = data;
		chart.options = computedOptions;
		chart.update('none');
	});
</script>

<div class="relative {className}">
	<canvas bind:this={canvasEl}></canvas>
</div>
