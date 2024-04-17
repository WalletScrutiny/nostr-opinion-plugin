<script>
	import { showLoginModal, showNonInteractiveLoginModal, showPrivateKeyLoginModal } from "../../../stores/stores";
    import LoginModal from "./LoginModal.svelte";

    function privateKeyLogin() {
        showNonInteractiveLoginModal.set(false);
        showPrivateKeyLoginModal.set(true);
    };
    function handleBackNavigation() {
        showNonInteractiveLoginModal.set(false);
        showLoginModal.set(true);
    };
</script>

<LoginModal>
    <span slot="back-button">
        <button class="back-button" on:click={handleBackNavigation}>&#8592;</button>
    </span>  
    <span slot="heading">Login</span>
    <span slot="description">You can connect with a nsec private key.<a href="/" class="text">(view associated risks).</a></span>
    <span slot="button">
        <div class="button-container">
            <button class="button" on:click={privateKeyLogin}>
                Connect using private key (nsec)
            </button>
        </div>
    </span>
</LoginModal>

<style>
    .button-container {
        display: flex;
    }
    .button {
        border: 3px solid black;
        border-radius: 25px;
        width: 100%;
        padding: 10px;
        font-size: large;
        background-color: white;
        margin: 55px 25px;
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
    .text {
        color: inherit;
    }
</style>