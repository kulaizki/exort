<script lang="ts">
	import { Header, Hero, Features, HowItWorks, CTA, Footer } from '$lib/features/landing';
</script>

<svelte:head>
	<title>exort</title>
	<meta name="description" content="sync your lichess games, analyze with stockfish, and get ai-powered coaching to improve your chess." />
	<meta property="og:title" content="exort" />
	<meta property="og:description" content="sync your lichess games, analyze with stockfish, and get ai-powered coaching to improve your chess." />
	<meta property="og:type" content="website" />
	<meta property="og:image" content="https://exort.fitzsixto.com/og.png" />
	<meta property="og:image:type" content="image/png" />
	<meta property="og:image:width" content="1200" />
	<meta property="og:image:height" content="630" />
	<meta property="og:image:alt" content="exort — chess improvement platform" />
	<meta property="og:url" content="https://exort.fitzsixto.com" />
	<meta name="twitter:card" content="summary_large_image" />
	<meta name="twitter:title" content="exort" />
	<meta name="twitter:description" content="sync your lichess games, analyze with stockfish, and get ai-powered coaching to improve your chess." />
	<meta name="twitter:image" content="https://exort.fitzsixto.com/og.png" />
</svelte:head>

<Header />
<main>
	<Hero />
	<Features />
	<HowItWorks />
	<CTA />
</main>
<Footer />
