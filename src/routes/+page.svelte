<script lang="ts">
	import { onMount } from 'svelte';

	let videoElement: HTMLVideoElement;
	let canvasElement: HTMLCanvasElement;
	let stream: MediaStream | null = null;
	let claudeResponse: string =
		'In darkness he sleeps \n A peaceful innocent face  Dreaming blissfully';

	onMount(async () => {
		try {
			stream = await navigator.mediaDevices.getUserMedia({ video: true });
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
			stream = await navigator.mediaDevices.getUserMedia({ video: true });
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
			stopCamera();
		};
	});
</script>

<div class="flex h-full flex-col gap-3">
	<div class="p-4 border border-white/30 rounded-lg bg-white/5 hover:bg-white/10 transition-colors">
		<h1 class="text-xl font-semibold text-white">Poetic Camera</h1>

		<button
			on:click={() => {
				if (stream) {
					stopCamera();
				} else {
					startCamera();
				}
			}}
			class="absolute bottom-2 right-2 px-4 py-1 bg-white/30 backdrop-blur-md border-2 border-white text-black rounded-full hover:bg-white transition-colors"
		>
			{stream ? 'Stop' : 'Start'}
		</button>
	</div>

	<div
		class="flex-1 border border-white/30 rounded-lg bg-white/5 hover:bg-white/10 transition-colors overflow-hidden"
	>
		<div class="relative flex flex-col items-center h-full">
			<video bind:this={videoElement} autoplay playsinline class="hidden">
				Your browser doesn't support video capture.
				<track kind="captions" />
			</video>
			<canvas bind:this={canvasElement} class="w-full h-full object-cover"></canvas>
			<div
				class="absolute inset-0 flex items-center justify-center bg-white/60 bg-blend-multiply backdrop-blur-md pointer-events-none"
			>
				<p class="text-white text-center text-[5vw]">
					{#each claudeResponse.split('\\n') as line}
						{line}<br />
					{/each}
				</p>
			</div>

			<button
				on:click={callClaudeAPI}
				class="absolute h-12 w-12 bottom-8 left-1/2 transform -translate-x-1/2 bg-white/30 backdrop-blur-md border-2 border-white text-black rounded-full hover:bg-white transition-colors"
			>
			</button>
		</div>
	</div>
</div>
