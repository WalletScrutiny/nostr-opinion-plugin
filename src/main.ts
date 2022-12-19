import App from './App.svelte';
import Login from './Login.svelte';
import { activeProfile } from './stores';
import nostr from './nostr';

class ExpertOpinions {
	public trustedAuthors: string[];
	/**
	 * if true it will only display opinions from trusted authors
	 */
	public onlyTrusted: boolean = false;
	constructor() {
		activeProfile.subscribe((value) => {
			nostr.setPrivateKey(value?.privkey);
		});
	}
}

export const expertOpinions = new ExpertOpinions();
