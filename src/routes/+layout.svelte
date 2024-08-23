<script>
	import '../app.css';
	import '@fontsource/inter-tight';
	import { onMount } from 'svelte';

	let appHeight;

	onMount(() => {
		const setAppHeight = () => {
			appHeight = window.innerHeight;
			document.documentElement.style.setProperty('--app-height', `${appHeight}px`);
		};

		setAppHeight();
		window.addEventListener('resize', setAppHeight);

		return () => {
			window.removeEventListener('resize', setAppHeight);
		};
	});
</script>

<div class="w-screen h-[var(--app-height)] bg-black p-2">
	<slot />
</div>

<style>
	:global(body) {
		font-family: 'Inter Tight', sans-serif;
		margin: 0;
		padding: 0;
		overflow: hidden;
	}

	:global(:root) {
		--app-height: 100%;
	}
</style>
