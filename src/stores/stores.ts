import { writable, type Writable } from 'svelte/store';
import type { NDKUser } from '@nostr-dev-kit/ndk';
import { localStorageStore } from '@skeletonlabs/skeleton';

export const ndkUser = writable<NDKUser | null>(null);
export const isNip05Valid = writable<{
	isNip05Valid: boolean | null;
	Nip05address: string | undefined;
	UserNpub: string | undefined;
	Vanity: string | undefined;
	UserIdentifier: string | undefined;
}>({
	isNip05Valid: null,
	Nip05address: undefined,
	UserNpub: undefined,
	Vanity: undefined,
	UserIdentifier: undefined
});

export const activeProfile = writable(null);
activeProfile.subscribe((value) => {
	if (!value) return;
	activeProfile.set(value);
});

interface UserLocalStore {
	lastUserLogged: string | undefined;
	pk: string | undefined;
}
export const localStore: Writable<UserLocalStore> = localStorageStore('localStore', {
	lastUserLogged: undefined,
	pk: undefined
});

export const themeModeLocalStorageObject = writable('colour-scheme');
export const theme = writable('light');
