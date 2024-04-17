<script>
	import { BunkerLoginService } from "../../../services/bunkerLoginService";
	import {showLoginModal, showMoreNewOpinions, showNsecBunker, toast} from "../../../stores/stores";
    import LoginModal from "./LoginModal.svelte";
    import Loader from '../../Loader.svelte';
    
    let nsec="";
    let loader = false;

    function triggerToast(type = 'success') {
		toast.set({ type: type, message: type === 'success' ? 'Logged in successfully' : 'Login Failed' });
	}
    async function nsecBunkerlogin() {
        loader = true;
        let value = await (new BunkerLoginService()).login(nsec);
        triggerToast(value);
        loader = false;
        showNsecBunker.set(false);
        showMoreNewOpinions.set(false);
    }
    function handleBackNavigation() {
        showNsecBunker.set(false);
        showLoginModal.set(true);
    };
</script>
{#if !loader}
<LoginModal>
    <span slot="back-button">
        <button class="back-button" on:click={handleBackNavigation}>&#8592;</button>
    </span>  
    <span slot="heading">Login with NsecBunker</span>
    <span slot="description">To log in remotely, enter your nsec bunker token, bunker:// string below. If you're not using a token, you'll need to approve authorization requests in your bunker's admin interface.</span>
    <span slot="button">
    <div class="button-container-input">
        <input
            id="nsec-bunker"
            type="text"
            bind:value={nsec}
            class="input"
        />
        <button class="login-button" on:click={nsecBunkerlogin}>
            Login
        </button>
    </div>
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
	.input {
		padding: 10px 20px;
		border-radius: 35px;
		width: 80%;
		font-size: large;
		border: 5px solid rgba(128, 126, 126, 0.591);
	}
	.button-container-input {
		display: flex;
		flex-direction: column;
		align-items: center;
		justify-content: center;
	}
	.login-button {
		border: 3px solid black;
		border-radius: 25px;
		width: 50%;
		padding: 15px 5px;
		font-size: larger;
		font-weight: bold;
		color: white;
		background-color: #e76932;
		margin: 15px 5px;
		cursor: pointer;
	}
    .back-button {
        cursor: pointer;
		background: none;
		border: none;
		width: 0px;
        margin-right: 100%;
		font-size: xx-large;
    }
</style>
