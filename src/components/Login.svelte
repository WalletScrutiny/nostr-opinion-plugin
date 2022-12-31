<svelte:options tag="nostr-opinion-login" />

<script>
	import { generatePrivateKey, getPublicKey } from 'nostr-tools';
	import { activeProfile } from '../stores';

	let privkey = '';

	const login = () => {
		if (!privkey) return;
		$activeProfile = {
			privkey,
			pubkey: getPublicKey(privkey)
		};
	};

	const nip07Login = async () => {
		if (!window.nostr) return;
		const pubkey = await window.nostr.getPublicKey();
		if (!pubkey) return;
		$activeProfile = {
			pubkey
		};
	};
</script>

<h3>Log in</h3>
<form on:submit|preventDefault>
	<p>
		Enter your Nostr private key below to be able to post an opinion. Don't have a key? Register.
	</p>
	<input id="privkey" type="text" bind:value={privkey} />
	<button on:click={login}>Login</button>
	{#if window.nostr}
		<button on:click={nip07Login}>Log in with browser extension</button>
	{/if}
</form>

<style>
</style>
