<script lang="ts">
	import { getContext } from 'svelte';
	import type { GameModel } from '../Game.svelte';

	import { fade } from 'svelte/transition';
	import KoishiNormal from '../../assets/koishi/normal.png';
	import KoishiNormal2 from '../../assets/koishi/normal2.png';
	import KoishiSad from '../../assets/koishi/sad.png';
	import KoishiShocked from '../../assets/koishi/shocked.png';
	import KoishiShocked2 from '../../assets/koishi/shocked2.png';
	import KoishiSmile2 from '../../assets/koishi/smile2.png';

	const { position, jump, state } = getContext<GameModel>('game');

	let image = KoishiNormal;

	$: {
		if ($state === -1) {
			image = KoishiSmile2;
		} else if ($state === 1) {
			image = KoishiSad;
		} else {
			image = $jump > 0 ? ($position < 3 ? KoishiShocked2 : KoishiShocked) : $position < 3 ? KoishiNormal2 : KoishiNormal;
		}
	}
</script>

<img
	out:fade|local={{ duration: 1000 }}
	class="absolute top-0 right-0 max-w-none"
	src={image}
	width="450"
	height="500"
	alt=""
	{...$$restProps}
/>
