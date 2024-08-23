<script>
	import '../app.css';
	import '@fontsource/inter-tight';
</script>

<div class="w-screen h-screen bg-black p-2">
	<slot />
</div>

<style>
	:global(body) {
		font-family: 'Inter Tight', sans-serif;
	}
</style>
