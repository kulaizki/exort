<script lang="ts">
	import { Header, Hero, Features, HowItWorks, CTA, Footer } from '$lib/features/landing';
</script>

<svelte:head>
	<title>exort</title>
	<meta name="description" content="sync your lichess games, analyze with stockfish, and get ai-powered coaching to improve your chess." />
	<meta property="og:title" content="exort" />
	<meta property="og:description" content="sync your lichess games, analyze with stockfish, and get ai-powered coaching to improve your chess." />
	<meta property="og:type" content="website" />
	<meta name="twitter:card" content="summary" />
	<meta name="twitter:title" content="exort" />
	<meta name="twitter:description" content="sync your lichess games, analyze with stockfish, and get ai-powered coaching to improve your chess." />
</svelte:head>

<Header />
<main>
	<Hero />
	<Features />
	<HowItWorks />
	<CTA />
</main>
<Footer />
