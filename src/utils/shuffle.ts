export function shuffle<T>(a: T[]) {
	for (let i = a.length, j: number, k: T; i; i--) {
		j = Math.floor(Math.random() * i);
		k = a[i - 1];
		a[i - 1] = a[j];
		a[j] = k;
	}
}
