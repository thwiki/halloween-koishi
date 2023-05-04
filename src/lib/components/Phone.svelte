<script lang="ts">
	import { getContext, onDestroy, onMount } from 'svelte';
	import { linear } from 'svelte/easing';
	import { tweened } from 'svelte/motion';
	import { fade } from 'svelte/transition';
	import PhoneBase from '../../assets/phone/base.png';
	import PhoneFront from '../../assets/phone/front.png';
	import PhonePhone from '../../assets/phone/phone.png';
	import type { GameModel } from '../Game.svelte';

	const { started, loaded, opened, ended, state, text } = getContext<GameModel>('game');

	let firstStarted = true;
	let connecting = false;

	let ringingAnimation: number;
	let ringingInternalAnimation: number;
	let loadingAnimation: number;
	let loadingDots = '';

	const rotate = tweened(0, {
		duration: 0,
		easing: linear,
	});
	let transformOrigin = '';

	onMount(() => {
		if (!$started) {
			startRingingAnimation();
		}
	});

	onDestroy(() => {
		endRingingAnimation();
		endLoadingAnimation();
	});

	function startRingingAnimation() {
		ringingAnimation = setInterval(() => {
			let i = 0;
			ringingInternalAnimation = setInterval(() => {
				if (i % 2) {
					$rotate = -(Math.random() * 3 + Math.sqrt(i));
					transformOrigin = '34px 20px';
				} else {
					$rotate = Math.random() * 3 + Math.sqrt(i);
					transformOrigin = '66px 20px';
				}
				++i;
				if (i > 12) {
					$rotate = 0;
					clearInterval(ringingInternalAnimation);
				}
			}, 50);
		}, 2000);
	}

	function endRingingAnimation() {
		clearInterval(ringingInternalAnimation);
		clearInterval(ringingAnimation);
		$rotate = 0;
	}

	async function startLoadingAnimation() {
		$rotate = 0;
		transformOrigin = '76px 20px';

		await rotate.set(90, { duration: 1000 });

		connecting = true;

		loadingDots = '';
		loadingAnimation = setInterval(() => {
			loadingDots += '.';
			if ($opened) {
				clearInterval(loadingAnimation);
			}
			if (loadingDots.length > 3) {
				loadingDots = '';
			}
		}, 500);
	}

	async function startClosingAnimation() {
		if ($state === 1) {
			$rotate = 90;
			transformOrigin = '76px 20px';

			await rotate.set(0, { duration: 1000 });
		} else {
			$rotate = 0;
		}
	}

	function endLoadingAnimation() {
		clearInterval(loadingAnimation);
		$rotate = 0;
	}

	$: {
		if ($started) {
			endRingingAnimation();

			if (firstStarted && !$loaded) {
				firstStarted = true;
				startLoadingAnimation();
			}
		}
	}

	$: {
		if ($ended) {
			startClosingAnimation();
		}
	}
</script>

<button
	in:fade|local={{ duration: 500, easing: linear }}
	out:fade|local={{ duration: 500, easing: linear }}
	class="grid absolute bottom-[120px] right-[20px] w-[100px] h-[75px] bg-full"
	on:click
>
	<img class="row-start-1 col-start-1 pointer-events-none" src={PhoneBase} alt="" />
	<img
		class="row-start-1 col-start-1 pointer-events-none transform"
		style:--tw-rotate="{$rotate}deg"
		style:transform-origin={transformOrigin}
		src={PhonePhone}
		alt=""
	/>
	<img class="row-start-1 col-start-1 pointer-events-none" src={PhoneFront} alt="" />
	<div
		class="absolute -top-5 left-3 text-sm text-[#43194a] opacity-0 transition-opacity duration-200"
		class:!opacity-100={connecting && !$opened}
	>
		{$text.loading}<span>{loadingDots}</span>
	</div>
</button>
