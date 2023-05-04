<script lang="ts" context="module">
	import { assign, loop, now, type Task } from 'svelte/internal';
	import { tweened } from 'svelte/motion';
	import { writable, type Readable } from 'svelte/store';

	interface Options {
		delay?: number;
		playbackRate?: number;
	}

	type Updater = (target_value: string, value: string) => string;

	export interface Typewritten extends Readable<string> {
		set(value: string, opts?: Options): Promise<void>;

		update(updater: Updater, opts?: Options): Promise<void>;
	}

	export function typewritten(value?: string, defaults: Options = {}): Typewritten {
		const store = writable(value);

		let task: Task;
		let target_value = value;

		function set(new_value: string, opts?: Options) {
			if (value == null) {
				store.set((value = new_value));
				return Promise.resolve();
			}

			target_value = new_value;

			let previous_task = task;
			let started = false;

			let { delay = 0, playbackRate = 1 } = assign(assign({}, defaults), opts);

			if (target_value === '') {
				if (previous_task) {
					previous_task.abort();
					previous_task = null;
				}

				store.set((value = target_value));
				return Promise.resolve();
			}

			const start = now() + delay;
			const parts = new_value.split('');
			let printProgress = 0;
			let nextPrintTime = 0;

			task = loop((now) => {
				if (now < start) return true;

				if (!started) {
					store.set((value = ''));
					nextPrintTime = 250 / playbackRate;
					started = true;
				}

				if (previous_task) {
					previous_task.abort();
					previous_task = null;
				}

				const elapsed = now - start;

				if (elapsed >= nextPrintTime) {
					if (parts[printProgress - 1] === '\b') {
						value = '';
					}
					if (printProgress < parts.length) {
						if (parts[printProgress] === ' ') {
							value += '&nbsp;';
							++printProgress;
							nextPrintTime += 100 / playbackRate;
						} else if (parts[printProgress] === '\t') {
							++printProgress;
							nextPrintTime += 600 / playbackRate;
						} else if (parts[printProgress] === '\n') {
							value += '<br />';
							++printProgress;
							nextPrintTime += 1000 / playbackRate;
						} else if (parts[printProgress] === '\b') {
							++printProgress;
							nextPrintTime += 3000 / playbackRate;
						} else if (parts[printProgress] === '*') {
							++printProgress;
							value += '<span>' + parts[printProgress] + '</span>';
							++printProgress;
							nextPrintTime += 200 / playbackRate;
						} else {
							value += parts[printProgress];
							++printProgress;
							nextPrintTime += 170 / playbackRate;
						}
					} else {
						return false;
					}

					store.set(value);
				}
				return true;
			});

			return task.promise;
		}

		return {
			set,
			update: (fn, opts?: Options) => set(fn(target_value, value), opts),
			subscribe: store.subscribe,
		};
	}
</script>

<script lang="ts">
	export const text = typewritten('', { playbackRate: 1 });
	export const opacity = tweened(0, { duration: 0 });
</script>

<div
	class="absolute bottom-[170px] right-5 w-[360px] min-h-[76px] leading-[30px] rounded-xl bg-black/90 text-gray-200 text-base py-2 px-4 [&>span]:text-blood-500 overflow-hidden"
	{...$$restProps}
	style:opacity={$opacity}
>
	{@html $text}
</div>
