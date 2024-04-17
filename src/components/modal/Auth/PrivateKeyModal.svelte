<script>
	import { PrivateKeyLoginService } from "../../../services/privateKeyLoginService";
	import {showMoreNewOpinions, showNonInteractiveLoginModal, showPrivateKeyLoginModal, toast } from "../../../stores/stores";
    import LoginModal from "./LoginModal.svelte";
    import Loader from '../../Loader.svelte';

    let nsec="";
    let loader = false;
    function triggerToast(type = 'success') {
		toast.set({ type: type, message: type === 'success' ? 'Logged in successfully' : 'Login Failed' });
	}

    async function PrivateKeylogin() {
        if(nsec.length == 0 || nsec==="" || !nsec.includes("nsec")) {
            alert("Please enter a valid private key");
            return;
        }
        loader = true;
        const value = await (new PrivateKeyLoginService()).login(nsec);
        loader = false;
        triggerToast(value);
        showPrivateKeyLoginModal.set(false);
        showMoreNewOpinions.set(false);
    }
    function handleBackNavigation() {
        showPrivateKeyLoginModal.set(false);
        showNonInteractiveLoginModal.set(true);
    };
</script>

{#if !loader}
<LoginModal>
    <span slot="back-button">
        <button class="back-button" on:click={handleBackNavigation}>&#8592;</button>
    </span>  
    <span slot="heading">Login Using Private Key</span>
    <span slot="description">Enter your Nostr private key below to be able to post an opinion.Don't have a key?<a href="/" class="text">Register.</a></span>
    <span slot="button">
    <div class="button-container-input">
        <input
            id="privkey"
            type="text"
            bind:value={nsec}
            class="input"
        />
        <button class="login-button" on:click={PrivateKeylogin}>
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
