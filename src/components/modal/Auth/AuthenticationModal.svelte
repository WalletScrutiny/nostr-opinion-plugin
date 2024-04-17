<script>
	import { showAuthenticationModal, showLoginModal, showRegistrationModal } from "../../../stores/stores";
	import LoginModal from "./LoginModal.svelte";

    // This switch is used to change modal state from authentication options to login options
    function handleLogin() {
        showAuthenticationModal.set(false);
        showLoginModal.set(true);
    }

    // Register flow is pending
    function handleRegister() {
        showAuthenticationModal.set(false);
        showRegistrationModal.set(true);
    }
    
</script>

<LoginModal> 
    <span slot="heading">Add Your Opinion</span>
    <span slot="description">Thank you for contributing your opinion. Please make sure to follow these simple guidelines: Be objective, Be polite</span>
    <span slot="button">
        <div class="button-container">
            <button class="button" on:click={handleLogin}> Login </button>
            <button class="button" on:click={handleRegister}> Register </button>
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
        width: 50%;
        padding: 10px;
        font-size: large;
        background-color: white;
        margin: 55px 25px;
        cursor: pointer;
    }
</style>