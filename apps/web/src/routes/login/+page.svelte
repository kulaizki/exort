<script lang="ts">
	import { LoginPage } from '$lib/features/auth';
	import type { ActionData } from './$types';

	let { form }: { form: ActionData } = $props();
</script>

<svelte:head>
	<title>Sign In | exort</title>
</svelte:head>

<LoginPage {form} />
