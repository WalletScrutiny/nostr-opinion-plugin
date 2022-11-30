import App from './App.svelte';
import Login from './Login.svelte';
import { activeProfile } from './stores';
import nostr from './nostr';

activeProfile.subscribe((value) => {
	nostr.setPrivateKey(value?.privkey);
});
