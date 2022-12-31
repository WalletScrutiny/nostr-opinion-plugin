<svelte:options tag="nostr-opinion-register" />

<script>
	import { generatePrivateKey, getPublicKey } from 'nostr-tools';
	import { onMount } from 'svelte';
	import { activeProfile } from '../stores';

	let privkey = '';

	const login = () => {
		if (!privkey) return;
		$activeProfile = {
			privkey,
			pubkey: getPublicKey(privkey)
		};
	};

	onMount(() => {
		privkey = generatePrivateKey();
	});
</script>

<h3>Register</h3>
<form on:submit|preventDefault>
	<p>
		We use Nostr to store opinions. You can post and access your posts via a unique private key.
		Copy your key and keep it in a safe place.
	</p>
	<input id="privkey" type="text" bind:value={privkey} />
	<button on:click={login}>Continue</button>
</form>

<style>
</style>
