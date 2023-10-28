import App from './App.svelte';
import { activeProfile } from './stores';
import { relayPool } from 'nostr-tools';
import type { RelayPool } from 'nostr-tools';

class ExpertOpinions {
	public trustedAuthors: string[];
	/**
	 * if true it will only display opinions from trusted authors
	 */
	public onlyTrusted: boolean = false;
	public nostr: RelayPool;
	public onReady: Promise<void>;
	private onReadyResolve: () => void;

	constructor() {
		this.nostr = relayPool();

		activeProfile.subscribe((value) => {
			this.nostr.setPrivateKey(value?.privkey);
		});

		this.onReady = new Promise((resolve) => {
			this.onReadyResolve = resolve;
		});
	}

	public setRelay(relay: string = 'wss://nos.lol') {
		this.nostr.addRelay(relay, { read: true, write: true });
	}

	public setReady() {
		this.onReadyResolve();
	}
}

export const expertOpinions = new ExpertOpinions();
