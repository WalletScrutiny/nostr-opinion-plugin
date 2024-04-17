import {
	NDKUser,
	NDKEvent,
	type NDKUserProfile,
	NDKNip07Signer,
	NDKPrivateKeySigner,
	NDKNip46Signer
} from '@nostr-dev-kit/ndk';
import { localStore, ndkUser, showAuthenticationModal, showLoginModal } from '../stores/stores';
import { isNip05Valid as isNip05ValidStore } from '../stores/stores';
import ndkStore, { bunkerNDKStore } from '../stores/provider';
import { db } from '@nostr-dev-kit/ndk-cache-dexie';
import { get as getStore } from 'svelte/store';
import { activeProfile } from '../stores/stores';

const outNostrLinksUrl: string = 'https://njump.me';

export function isNip05(input: string | undefined): boolean {
	if (input === undefined) {
		return false;
	}
	const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
	return emailRegex.test(input);
}

export function sortEventList(eventList: NDKEvent[]) {
	eventList.sort((a, b) => (b.created_at ?? 0) - (a.created_at ?? 0));
}

export async function fetchUserProfile(opts: string): Promise<NDKUserProfile> {
	try {
		if (window) {
			const user = await db.users.where({ pubkey: opts }).first();
			if (!user) {
				const $ndk = getStore(ndkStore);
				const ndkUser = $ndk.getUser({ pubkey: opts });
				await ndkUser.fetchProfile({
					closeOnEose: true,
					groupable: false,
					groupableDelay: 200
				});
				return ndkUser.profile as NDKUserProfile;
			} else {
				return user.profile as NDKUserProfile;
			}
		} else {
			return {};
		}
	} catch (error) {
		console.error(error);
		throw error;
	}
}

export function logout() {
	ndkUser.set(null);
	isNip05ValidStore.set({
		isNip05Valid: null,
		Nip05address: undefined,
		UserNpub: undefined,
		Vanity: undefined,
		UserIdentifier: undefined
	});
	activeProfile.set(null);
	showAuthenticationModal.set(false);
	showLoginModal.set(false);
	localStore.update(() => {
		return {
			lastUserLogged: undefined,
			pk: undefined
		};
	});
}

export async function nsecBunkerLogin(nip46ConnectionString: string): Promise<NDKUser | undefined> {
	const $ndk = getStore(ndkStore);
	const $bunkerNDK = getStore(bunkerNDKStore);
	ndkStore.set($ndk);
	bunkerNDKStore.set($bunkerNDK);

	const existingPrivateKey = localStorage.getItem('nostr-nsecbunker-key');
	let localSigner: NDKPrivateKeySigner;
	// console.log(existingPrivateKey);

	if (existingPrivateKey) {
		localSigner = new NDKPrivateKeySigner(existingPrivateKey);

		if (!localSigner.privateKey) {
			localSigner = NDKPrivateKeySigner.generate();
		}
	} else {
		localSigner = NDKPrivateKeySigner.generate();
	}

	let remoteSigner: NDKNip46Signer;

	if (nip46ConnectionString.includes('@')) {
		const user = await $ndk.getUserFromNip05(nip46ConnectionString);
		if (!user?.pubkey) throw new Error('Cant find user');
		console.log('Found user', user);

		remoteSigner = new NDKNip46Signer($ndk, nip46ConnectionString, localSigner);

		remoteSigner.remoteUser = user;
		remoteSigner.remotePubkey = user.pubkey;
	} else if (nip46ConnectionString.startsWith('bunker://')) {
		const uri = new URL(nip46ConnectionString);

		const pubkey = uri.host || uri.pathname.replace('//', '');
		const relays = uri.searchParams.getAll('relay');
		for (const relay of relays) $ndk.addExplicitRelay(relay);
		if (relays.length === 0) throw new Error('Missing relays');
		remoteSigner = new NDKNip46Signer($ndk, pubkey, localSigner);
		remoteSigner.relayUrls = relays;
	} else {
		remoteSigner = new NDKNip46Signer($ndk, nip46ConnectionString, localSigner);
	}

	remoteSigner.rpc.on('authUrl', (url: string) => {
		console.log(url);
		window.open(url, '_blank');
	});

	await remoteSigner.blockUntilReady();
	await remoteSigner.user();

	if (!existingPrivateKey) {
		localStorage.setItem('nostr-nsecbunker-key', localSigner.privateKey!);
	}
	$ndk.signer = remoteSigner;
	const ndkCurrentUser = await remoteSigner.user();
	const user = $ndk.getUser({
		pubkey: ndkCurrentUser.pubkey,
		npub: ndkCurrentUser.npub
	});
	ndkUser.set(user);
	localStore.set({ lastUserLogged: ndkCurrentUser.npub, pk: undefined });
	return user;
}

export async function NDKlogin(): Promise<NDKUser | undefined> {
	const $ndk = getStore(ndkStore);
	const signer = new NDKNip07Signer();
	$ndk.signer = signer;
	// let value = await signer.blockUntilReady();
	ndkStore.set($ndk);
	const ndkCurrentUser = await signer.user();
	const user = $ndk.getUser({
		pubkey: ndkCurrentUser.pubkey,
		npub: ndkCurrentUser.npub
	});
	ndkUser.set(user);
	localStore.set({ lastUserLogged: ndkCurrentUser.npub, pk: undefined });
	return user;
}

export async function privkeyLogin(pk: string): Promise<NDKUser | undefined> {
	if (!pk) return undefined;

	const $ndk = getStore(ndkStore);
	const signer = new NDKPrivateKeySigner(pk);
	$ndk.signer = signer;
	ndkStore.set($ndk);
	const ndkCurrentUser = await signer.user();
	const user = $ndk.getUser({
		pubkey: ndkCurrentUser.pubkey,
		npub: ndkCurrentUser.npub
	});
	ndkUser.set(user);
	localStore.set({ lastUserLogged: ndkCurrentUser.npub, pk });
	return user;
}

export function truncateString(str?: string): string {
	if (str === undefined) {
		return '';
	} else {
		return str.substring(0, 12) + ':' + str.substring(str.length - 6);
	}
}

export function truncatedBech(bech32: string, length?: number): string {
	return `${bech32.substring(0, length || 9)}...`;
}

export function parseNostrUrls(rawContent: string): string {
	const nostrPattern = /nostr:(nprofile|nevent|naddr|npub1)(\w+)/g;
	return rawContent.replace(nostrPattern, (match, type, id) => {
		const nostrEntity = type + id;
		const nostrEntityUrl = `${outNostrLinksUrl}/${nostrEntity}`;
		switch (type) {
			case 'nprofile':
				return `${nostrEntityUrl}`;
			case 'nevent':
			case 'naddr':
				return `${nostrEntityUrl}`;
			default:
				return match;
		}
	});
}

export function calculateRelativeTime(timestamp: number) {
	const now = new Date();
	const eventDate = new Date(timestamp * 1000);
	const diffInSeconds = Math.floor((now.valueOf() - eventDate.valueOf()) / 1000);

	if (diffInSeconds < 60) return `${diffInSeconds} seconds ago`;
	if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)} minutes ago`;
	if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)} hours ago`;
	return `${Math.floor(diffInSeconds / 86400)} days ago`;
}
