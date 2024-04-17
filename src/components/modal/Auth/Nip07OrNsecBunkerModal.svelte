<script lang="ts">
	import { NIP07LoginService } from '../../../services/nip07LoginService';
	import {
		showAuthenticationModal,
		showLoginModal,
		showMoreNewOpinions,
		showNonInteractiveLoginModal,
		showNsecBunker,
		toast
	} from '../../../stores/stores';
	import Loader from '../../Loader.svelte';
	import LoginModal from './LoginModal.svelte';

	function triggerToast(type = 'success') {
		toast.set({ type: type, message: type === 'success' ? 'Logged in successfully' : 'Login Failed' });
	}

    let loader:boolean = false;

	async function nip07Login() {
		loader = true;
        const value = await (new NIP07LoginService()).login();
        triggerToast(value);
        loader = false;
		showLoginModal.set(false);
        showMoreNewOpinions.set(false);
	}
	function nsecBunkerLogin() {
		showLoginModal.set(false);
        showNsecBunker.set(true);
	}
	function showMore() {
		showNonInteractiveLoginModal.set(true);
		showLoginModal.set(false);
	}
	function handleBackNavigation() {
		showLoginModal.set(false);
		showAuthenticationModal.set(true);
	}
</script>

{#if !loader}
<LoginModal>
    <span slot="back-button">
        <button class="back-button" on:click={handleBackNavigation}>&#8592;</button>
    </span>  
    <span slot="heading">Login</span>
    <span slot="description">You have two options to log in. You can connect with an authentication tool like Alby that supports Nostr. Or you can connect via nsec bunker.<a href="/" class="text">(view associated risks).</a></span>
    <span slot="button">
        <div class="button-container">
            <button class="button" on:click|preventDefault|stopPropagation={nip07Login}>
                Connect using browser extension
            </button>
            <button class="button" on:click={nsecBunkerLogin}>
                Connect using nsec bunker
            </button>
        </div>
    </span>
    <span slot="showMore">
        <button class="show-more-button" on:click={showMore}>Advanced login options</button>
    </span>
 
</LoginModal>
{/if}
{#if loader}
<LoginModal>
    <span slot="loader">
        <Loader/>
    </span>
</LoginModal>
{/if}
<style>
    .button-container {
        display: flex;
    }
    .button {
        border: 3px solid black;
        border-radius: 25px;
        width: 50%;
        padding: 10px;
        font-size: large;
        background-color: white;
        margin: 55px 25px;
        cursor: pointer;
    }
    .show-more-button {
        background: none;
        border: none;
        color: inherit;
        cursor: pointer;
        font-size: 16px;
        text-decoration: underline;
    }
    .show-more-button:hover {
        text-decoration: none;
    }
    .back-button {
        cursor: pointer;
		background: none;
		border: none;
		width: 0px;
		margin-right: 100%;
		font-size: xx-large;
	}
    .text {
       color: inherit;
    }
</style>
