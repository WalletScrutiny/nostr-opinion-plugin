<script lang="ts">
	import { showAuthenticationModal, showRegistrationModal, showSetupProfileModal } from '../../../stores/stores';
	import LoginModal from './LoginModal.svelte';
    import SetupProfileModal from './SetupProfileModal.svelte';


	let name: string;
	let about = '';
	let imageUrl = '';
    
	const saveProfile = async () => {
		if(!name) {
			return;
		}
        showRegistrationModal.set(false);
        showSetupProfileModal.set(true);
	};

	function handleBackNavigation() {
		showRegistrationModal.set(false);
		showAuthenticationModal.set(true);
	}
</script>

{#if $showRegistrationModal}
<LoginModal>
	<span slot="back-button">
		<button class="back-button" on:click={handleBackNavigation}>&#8592;</button>
	</span>
	<span slot="heading">Set up your profile </span>
	<span slot="description">
		This information will be shown with your comments. To upload images, use a service like Piccy.
	</span>
	<span slot="button">
		<p >Enter Your Name....</p>
		<input type="text" required class="input-box" bind:value={name} />
		<p >Share a bit about yourself...</p>
		<input type="text" class="input-box" bind:value={about} />
		<p >Link to a profile image...</p>
		<input type="text" class="input-box" bind:value={imageUrl} />
	</span>
	<span class="show-more" slot="showMore">
		<button class="show-more-button" on:click={saveProfile}>Continue</button>
	</span>
</LoginModal>
{/if}

{#if $showSetupProfileModal}
<SetupProfileModal {name} {about} {imageUrl}/>
{/if}



<style>
	.input-box {
		width: 100%;
		border-radius: 20px;
		padding: 15px 5px;
        font-size: large;
	}
	.back-button {
		cursor: pointer;
		background: none;
		border: none;
		width: 0px;
		margin-right: 100%;
		font-size: xx-large;
	}
    .show-more-button{
        width: auto;
        border: 3px solid black;
        border-radius: 25px;
        padding: 10px 25px;
        margin: 10px;
        font-size: large;
		cursor: pointer;
    }
</style>
