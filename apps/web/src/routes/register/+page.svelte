<script lang="ts">
	import { RegisterPage } from '$lib/features/auth';
	import type { ActionData } from './$types';

	let { form }: { form: ActionData } = $props();
</script>

<svelte:head>
	<title>Sign Up | exort</title>
</svelte:head>

<RegisterPage {form} />
