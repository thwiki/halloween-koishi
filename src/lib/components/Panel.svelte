<script lang="ts">
	import { getContext } from 'svelte';
	import { linear } from 'svelte/easing';
	import { tweened, type Tweened } from 'svelte/motion';
	import { fade, fly } from 'svelte/transition';
	import type { GameModel } from '../Game.svelte';

	import Title from '../../assets/title.png';
	import { wait } from '../../utils/wait';
	import Koishi from './Koishi.svelte';
	import Typewriter, { type Typewritten } from './Typewriter.svelte';

	const game = getContext<GameModel>('game');
	const { clickable, line, opts, state, ended, text } = game;

	async function hideOptions(selected: 1 | 2) {
		if (!$clickable) return;

		$clickable = false;

		option1Active = false;
		option2Active = false;

		if (selected === 1) {
			await Promise.all([option1Opacity.set(0, { delay: 100, duration: 1000 }), option2Opacity.set(0, { delay: 600, duration: 1000 })]);

			option1Hidden = true;
			await option1Opacity.set(1);

			option1Text = '';
			option2Text = '';

			game.selectOption(1);
		} else {
			await Promise.all([option2Opacity.set(0, { delay: 100, duration: 1000 }), option1Opacity.set(0, { delay: 600, duration: 1000 })]);

			option2Hidden = true;
			await option2Opacity.set(1);

			option1Text = '';
			option2Text = '';

			game.selectOption(2);
		}
	}

	async function showOptions(option1: string, option2: string) {
		$clickable = false;

		await optionsTop.set(20);

		await Promise.all([
			optionsTop.set(0, { duration: 800 }),
			(async () => {
				option1Hidden = false;
				option1Text = option1;
				await option1Opacity.set(0);
				await option1Opacity.set(1, { duration: 800 });
				option1Active = true;
			})(),
			(async () => {
				option2Hidden = false;
				option2Text = option2;
				await option2Opacity.set(0);
				await option2Opacity.set(1, { duration: 800 });
				option2Active = true;
			})(),
		]);

		$clickable = true;
	}

	async function talk(q: string, a: string, b: string) {
		await questionText.set(q);

		if ($titleOpacity === 0) {
			await titleOpacity.set(1, { duration: 600 });
		}

		await showOptions(a, b);
	}

	let questionText: Typewritten;
	let questionOpacity: Tweened<number>;
	let titleOpacity = tweened(0, { duration: 0 });
	let optionsTop = tweened(0, { duration: 0 });
	let option1Opacity = tweened(1, { duration: 0 });
	let option2Opacity = tweened(1, { duration: 0 });
	let option1Text = '';
	let option2Text = '';
	let option1Hidden = true;
	let option2Hidden = true;
	let option1Active = true;
	let option2Active = true;

	let showKoishi = true;
	let showLosing = false;
	let showCut = false;
	let showBlack = false;
	let showNote = false;

	async function runGoodEndingAnimation() {
		questionText.set('');
		await titleOpacity.set(0, { duration: 500 });
		await questionText.set($text.goodEnding);

		await wait(500);
		showKoishi = false;
		questionText.set('');

		await wait(1200);
		await questionText.set($text.silent);

		await wait(1000);
		await questionOpacity.set(0, { duration: 500 });

		await wait(500);
		$ended = true;
	}

	async function runBadEndingAnimation() {
		questionText.set('');
		await titleOpacity.set(0, { duration: 500 });
		await questionText.set($text.badEnding);

		showLosing = true;
		showCut = true;
		await wait(800);
		showBlack = true;
		await wait(800);
		showCut = false;
		await wait(1000);
		showNote = true;
		$questionOpacity = 0;
		showKoishi = false;
		await wait(5000);
		showNote = false;
		await wait(500);
		showBlack = false;
		await wait(2000);
		showLosing = false;

		await wait(200);
		$ended = true;
	}

	async function onReady() {
		await questionOpacity.set(1, { duration: 500 });
		game.updateQuestion();
	}

	$: {
		if ($opts.length) {
			talk($line, $opts[0].text, $opts[1].text);
		}
	}

	$: {
		if ($state === -1) {
			runBadEndingAnimation();
		} else if ($state === 1) {
			runGoodEndingAnimation();
		}
	}
</script>

<div
	in:fade|local={{ duration: 1500, easing: linear }}
	out:fade|local={{ duration: 1000, easing: linear }}
	on:introend={onReady}
	class="absolute inset-0 select-none pointer-events-none z-10"
>
	{#if showKoishi}
		<Koishi />
	{/if}

	<Typewriter bind:text={questionText} bind:opacity={questionOpacity} />

	<div class="absolute top-[345px] w-full h-[23px] right-0 border-b-4 border-blood-500" style:opacity={$titleOpacity}>
		<img src={Title} class="ml-3" width="200" height="12" alt="" />
	</div>
	<div class="absolute top-[380px] right-5 w-[360px] transform" style:--tw-translate-y="{$optionsTop}px">
		<button
			class="flex items-center group mb-5 w-full h-10 rounded-xl px-4 text-[15px] text-zinc-800 bg-gray-300/80 border-2 border-koipurple-700/90 transition-colors pointer-events-auto {option1Active
				? 'hover:bg-koigreen-100/80 hover:border-koigreen-500/80 cursor-pointer'
				: ''}"
			class:active={option1Active}
			class:!hidden={option1Hidden}
			style:opacity={$option1Opacity}
			on:click|preventDefault={() => hideOptions(1)}
		>
			<div class="text-koipurple-900 font-bold mr-2 group-hover:text-koigreen-900">1</div>
			{option1Text}
		</button>
		<button
			class="flex items-center group mb-5 w-full h-10 rounded-xl px-4 text-[15px] text-zinc-800 bg-gray-300/80 border-2 border-koipurple-700/90 transition-colors pointer-events-auto {option2Active
				? 'hover:bg-koigreen-100/80 hover:border-koigreen-500/80 cursor-pointer'
				: ''}"
			class:active={option2Active}
			class:!hidden={option2Hidden}
			style:opacity={$option2Opacity}
			on:click|preventDefault={() => hideOptions(2)}
		>
			<div class="text-koipurple-900 font-bold mr-2 group-hover:text-koigreen-900">2</div>
			{option2Text}
		</button>
	</div>
</div>

{#if showLosing}
	<div class="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-screen h-screen z-20 pointer-events-none">
		{#if showCut}
			<div class="fixed left-0 bg-blood-500 z-30 animate-cut" />
		{/if}
		{#if showBlack}
			<div in:fade|local={{ duration: 800 }} out:fade|local={{ duration: 2000 }} class="fixed inset-0 bg-black z-40" />
		{/if}
		{#if showNote}
			<div
				in:fly|local={{ y: '48px', duration: 3000 }}
				out:fade|local={{ duration: 1000 }}
				class="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-blood-500 text-4xl leading-none z-50"
			>
				DEAD END
			</div>
		{/if}
	</div>
{/if}
