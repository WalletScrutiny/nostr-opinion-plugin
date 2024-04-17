<svelte:options customElement="nostr-opinion-login" />

<script lang="ts">
	import { showAuthenticationModal, showLoginModal, showNonInteractiveLoginModal, showNsecBunker, showPrivateKeyLoginModal, showRegistrationModal } from '../stores/stores';
	import GuestOrPrivateKeyModal from './modal/Auth/GuestOrPrivateKeyModal.svelte';
	import AuthenticationModal from './modal/Auth/AuthenticationModal.svelte';
	import  Nip07OrNsecBunkerModal from './modal/Auth/Nip07OrNsecBunkerModal.svelte';
	import PrivateKeyModal from './modal/Auth/PrivateKeyModal.svelte';
	import RegistrationModal from './modal/Auth/RegistrationModal.svelte';
	import NsecBunkerModal from './modal/Auth/NsecBunkerModal.svelte';
</script>

{#if $showAuthenticationModal}
	<AuthenticationModal />
{/if}

{#if $showNonInteractiveLoginModal}
	<GuestOrPrivateKeyModal />
{/if}

{#if $showLoginModal} 
	<Nip07OrNsecBunkerModal />
{/if}

{#if $showPrivateKeyLoginModal} 
	<PrivateKeyModal />
{/if}

{#if $showRegistrationModal}
<RegistrationModal />
{/if}

{#if $showNsecBunker}
<NsecBunkerModal />
{/if}


