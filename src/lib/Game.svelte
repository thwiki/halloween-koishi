<script lang="ts" context="module">
	import { derived, get, writable } from 'svelte/store';
	import plot from '../assets/plot.json';
	import { shuffle } from '../utils/shuffle';

	export type Option = (typeof plot)['locations'][number]['options'][number];

	export class GameModel {
		started = writable(false);
		loaded = writable(false);
		opened = writable(false);
		ended = writable(false);
		clickable = writable(false);

		position = writable(6);
		jump = writable(0);
		line = writable('');
		opts = writable<Option[]>([]);

		state = derived(this.position, ($position) => ($position === 0 ? -1 : $position === this.lastPosition ? 1 : 0));

		lastPosition = plot.locations.length - 1;
		text = writable({
			loading: plot.loading,
			announce: plot.announce,
			silent: plot.silent,
			badEnding: plot.badEnding,
			goodEnding: plot.goodEnding,
		});

		updateQuestion() {
			const $position = get(this.position);
			const $jump = get(this.jump);

			const location = plot.locations[$position];
			const badOptions = location.options.filter((option) => option.jump < 0 && option.jump !== -$jump);
			const goodOptions = location.options.filter((option) => option.jump >= 0 && option.jump !== -$jump);

			let options: Option[] = [];
			// prepare options randomly
			if (Math.random() < 1 - Math.pow($position - 8, 2) / 150) {
				// 1 good and 1 bad
				options[0] = badOptions[Math.floor(Math.random() * badOptions.length)];
				options[1] = goodOptions[Math.floor(Math.random() * goodOptions.length)];
				shuffle(options);
			} else {
				// 2 bad, 1 good if not enough
				shuffle(badOptions);
				options[0] = badOptions[0];
				options[1] = badOptions[1] ?? goodOptions[Math.floor(Math.random() * goodOptions.length)];
			}

			this.opts.set(options);
			this.line.set(this.announce(location.name));
		}

		private announce(line: string) {
			return plot.announce.replace('{}', line.replace(/./g, '*$&'));
		}

		selectOption(opt: 1 | 2) {
			const $opts = get(this.opts);
			const jump = $opts[opt - 1].jump;

			this.jump.set(jump);
			this.position.update((value) => value + jump);

			const $state = get(this.state);

			if ($state === -1) {
				// lost
			} else if ($state === 1) {
				// win
			} else {
				this.updateQuestion();
			}
		}
	}
</script>

<script lang="ts">
	import { setContext } from 'svelte';
	import { wait } from '../utils/wait';
	import Panel from './components/Panel.svelte';
	import Phone from './components/Phone.svelte';

	const game = new GameModel();
	setContext('game', game);

	const { started, loaded, opened, ended } = game;

	async function onStart() {
		if ($started) return;
		$started = true;

		await wait(3500);
		$loaded = true;

		if ($opened) return;
		$opened = true;
	}
</script>

<main class="w-[400px] h-[500px] bg-white dark:bg-zinc-900">
	{#if $opened && !$ended}
		<Panel />
	{:else}
		<Phone on:click={onStart} />
	{/if}
</main>
