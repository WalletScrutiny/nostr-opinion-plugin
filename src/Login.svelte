<script>
  import { generatePrivateKey, getPublicKey } from 'nostr-tools';
  import { activeProfile } from './stores';

  let privkey = '';

  const login = () => {
    if (!privkey) return;
    $activeProfile = {
      privkey,
      pubkey: getPublicKey(privkey),
    };
  };
</script>

<form on:submit|preventDefault>
  <p>Logged in with pubkey: {$activeProfile?.pubkey}</p>
  <label for="privkey"> Private Key </label>
  <input id="privkey" type="text" bind:value={privkey} />
  <button on:click={login}>Login</button>
  <button on:click={() => (privkey = generatePrivateKey())}>Generate</button>
</form>

<style>
</style>
