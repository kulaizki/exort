<script lang="ts">
  const steps = [
    'Analyzing your games...',
    'Looking at performance data...',
    'Preparing coaching insights...'
  ];

  let currentStep = $state(0);

  $effect(() => {
    const interval = setInterval(() => {
      currentStep = (currentStep + 1) % steps.length;
    }, 3000);
    return () => clearInterval(interval);
  });
</script>

<div class="flex items-center gap-2 text-sm text-neutral-400">
  <svg class="h-4 w-4 animate-spin" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
    <circle cx="12" cy="12" r="10" stroke-opacity="0.25" />
    <path d="M12 2a10 10 0 0 1 10 10" stroke-linecap="round" />
  </svg>
  <span class="transition-opacity duration-300">{steps[currentStep]}</span>
</div>
