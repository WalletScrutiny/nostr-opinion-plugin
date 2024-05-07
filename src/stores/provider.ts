import { writable } from 'svelte/store';
import NDKSvelte from '@nostr-dev-kit/ndk-svelte';
import type { NDKCacheAdapter } from '@nostr-dev-kit/ndk';
import NDKCacheAdapterDexie from '@nostr-dev-kit/ndk-cache-dexie';
import NDK from '@nostr-dev-kit/ndk';

let cacheAdapter: NDKCacheAdapter | undefined;

export const defaulRelaysUrls: string[] = [
	'wss://purplepag.es',
	'wss://relay.nostr.band',
	'wss://nos.lol',
	'wss://offchain.pub/',
	'wss://nostr-pub.wellorder.net',
	'wss://nostr.mutinywallet.com '
];

if (typeof window !== 'undefined') {
	cacheAdapter = new NDKCacheAdapterDexie({
		dbName: 'walletScrutiny',
		expirationTime: 3600 * 24 * 2
	});
}

const ndk = new NDKSvelte({
	explicitRelayUrls: defaulRelaysUrls,
	cacheAdapter
});

const ndkStore = writable(ndk);

const _bunkerNDK = new NDK({
	explicitRelayUrls: [
		'wss://relay.nsecbunker.com',
		'wss://nostr.vulpem.com',
		'wss://relay.nsec.app'
	]
});

export const bunkerNDKStore = writable(_bunkerNDK);

export default ndkStore;
