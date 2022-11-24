import App from './App.svelte';
import Login from './Login.svelte';
import { activeProfile } from './stores';
import nostr from './nostr';

document.addEventListener('readystatechange', () => {
	activeProfile.subscribe((value) => {
		nostr.setPrivateKey(value?.privkey);
	});
	if (document.readyState === 'complete') {
		document.querySelectorAll('[data-nostrOpinion]').forEach((el, i) => {
			new App({
				target: el,
				props: {
					name: el.attributes['data-nostrOpinion'].value
				}
			});
		});
		new Login({
			target: document.querySelector('[data-nostrOpinion-login]')
		});
	}
});
