<script lang="ts">
	import { onMount } from 'svelte';
	import { fade } from 'svelte/transition';

	let videoElement: HTMLVideoElement;
	let canvasElement: HTMLCanvasElement;
	let stream: MediaStream | null = null;
	let claudeResponse: string = 'take a picture to generate a poem';

	let visibleChars = 0;
	let intervalId: NodeJS.Timeout;

	function animateText() {
		clearInterval(intervalId);
		visibleChars = 0;
		intervalId = setInterval(() => {
			visibleChars += 1;
			if (visibleChars >= claudeResponse.length) {
				clearInterval(intervalId);
			}
		}, 50); // Adjust speed as needed
	}

	$: if (claudeResponse) {
		animateText();
	}

	onMount(async () => {
		try {
			stream = await navigator.mediaDevices.getUserMedia({
				video: {
					facingMode: 'environment'
				}
			});
			if (videoElement) {
				videoElement.srcObject = stream;
				startVideoProcessing();
			}
		} catch (error) {
			console.error('Error accessing camera:', error);
		}
	});

	function stopCamera() {
		if (stream) {
			stream.getTracks().forEach((track) => track.stop());
			stream = null;
		}
	}

	async function startCamera() {
		try {
			stream = await navigator.mediaDevices.getUserMedia({
				video: {
					facingMode: 'environment'
				}
			});
			if (videoElement) {
				videoElement.srcObject = stream;
				startVideoProcessing();
			}
		} catch (error) {
			console.error('Error accessing camera:', error);
		}
	}

	function startVideoProcessing() {
		if (!canvasElement || !videoElement) return;
		const ctx = canvasElement.getContext('2d');
		if (!ctx) return;

		function processFrame() {
			if (!canvasElement || !videoElement || !ctx) return;
			canvasElement.width = videoElement.videoWidth;
			canvasElement.height = videoElement.videoHeight;

			ctx.drawImage(videoElement, 0, 0, canvasElement.width, canvasElement.height);

			requestAnimationFrame(processFrame);
		}

		processFrame();
	}

	async function callClaudeAPI() {
		if (!canvasElement) return;

		const imageDataUrl = canvasElement.toDataURL('image/jpeg');
		const base64Image = imageDataUrl.split(',')[1];

		try {
			const response = await fetch('/api/claude', {
				method: 'POST',
				headers: {
					'Content-Type': 'application/json'
				},
				body: JSON.stringify({ image: base64Image })
			});

			if (!response.ok) {
				throw new Error('Failed to call Claude API');
			}

			const data = await response.json();
			claudeResponse = data.response;
		} catch (error) {
			console.error('Error calling Claude API:', error);
			claudeResponse = 'Error: Failed to get a response from Claude.';
		}
	}

	onMount(() => {
		return () => {
			clearInterval(intervalId);
			stopCamera();
		};
	});
</script>

<div class="flex h-full flex-col gap-0">
	<div
		class="flex-1 rounded-[30px] border border-white/30 bg-white/5 hover:bg-white/10 transition-colors overflow-hidden"
	>
		<div class="relative flex flex-col items-center h-full">
			<video bind:this={videoElement} autoplay playsinline class="hidden">
				Your browser doesn't support video capture.
				<track kind="captions" />
			</video>
			<canvas bind:this={canvasElement} class="w-full h-full object-cover"></canvas>
			<div
				class="absolute inset-0 flex items-center justify-center bg-white/60 bg-blend-multiply backdrop-blur-xl"
			>
				<p class="text-white text-center text-[5vw]">
					{#each claudeResponse.split('\\n') as line}
						{#each line.split('') as char, index}
							{#if index < visibleChars}
								<span
									in:fade={{ duration: 300, delay: index * 20 }}
									class="inline-block"
									style="animation: dither {Math.random() * 0.5 + 0.5}s ease-out;"
								>
									{char === ' ' ? '\u00A0' : char}
								</span>
							{/if}
						{/each}
						<br />
					{/each}
				</p>
			</div>

			<div
				class="p-4 flex absolute top-0 left-0 right-0 justify-between items-center border-b border-white/30 bg-white/10 hover:bg-white/10 transition-colors"
			>
				<h1 class="text-xl font-semibold text-white">Poetic Camera</h1>

				<button
					on:click={() => {
						if (stream) {
							stopCamera();
						} else {
							startCamera();
						}
					}}
					class="px-4 py-1 bg-white/10 backdrop-blur-md border-2 border-white text-white rounded-full hover:bg-white transition-colors"
				>
					{stream ? 'Stop' : 'Start'}
				</button>
			</div>

			<button
				on:click={callClaudeAPI}
				class="absolute h-16 w-16 bottom-8 left-1/2 transform -translate-x-1/2 bg-white/30 backdrop-blur-md border-4 border-white/40 text-black rounded-full hover:bg-white transition-colors"
			>
			</button>
		</div>
	</div>
</div>

<style>
	@keyframes dither {
		0% {
			opacity: 0;
			filter: blur(200px);
		}
		100% {
			opacity: 1;
			filter: blur(0);
		}
	}
</style>
