import { writable } from 'svelte/store';

export const activeProfile = writable(null);
activeProfile.subscribe((value) => {
	if (!value) return;
	localStorage.setItem('activeProfile', JSON.stringify(value));
});

activeProfile.set(JSON.parse(localStorage.getItem('activeProfile')));
