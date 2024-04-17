<script lang="ts">
	import { fade } from 'svelte/transition';
	import { showAuthenticationModal, showLoginModal, showNonInteractiveLoginModal, showNsecBunker, showPrivateKeyLoginModal, showRegistrationModal, showSetupProfileModal, theme } from '../../../stores/stores';

	// Close login modal, it is a generic method which sets off the auth specific modal flags
	function closeModal() {
		showLoginModal.set(false);
		showAuthenticationModal.set(false);
		showNonInteractiveLoginModal.set(false);
		showRegistrationModal.set(false);
		showSetupProfileModal.set(false);
		showNsecBunker.set(false);
		showPrivateKeyLoginModal.set(false);
	};
</script>

<div class="modal-wraper" transition:fade={{ duration: 100 }}>
	<div class="modal" transition:fade={{ duration: 500, delay: 0 }} class:dark={$theme === 'dark'}>
		<div class="container" class:dark={$theme === 'dark'}>
			<div class="header">
				<button class="close" on:click={closeModal} class:dark-close={$theme==='dark'}>&times;</button>
				<slot name="back-button"/>
			</div>
			<slot name="loader"/>
			<h1 class="heading">
				<slot name="heading" />
			</h1>
			<div class="add-opinion">
				<div class="description">
					<slot name="description" />
				</div>
			</div>
			<slot name="button" />
			<slot name="showMore" />
			
		</div>
	</div>
</div>

<style>
	.modal-wraper {
		position: fixed;
		top: 0;
		left: 0;
		width: 100%;
		height: 100%;
		background-color: rgba(0, 0, 0, 0.689);
		backdrop-filter: blur(10px);
		display: flex;
		justify-content: center;
		align-items: center;
		text-align: center;
		z-index: 2;
	}
	.modal {
		background-color: rgb(255, 255, 255);
		width: 35vw;
		padding: 20px;
		min-height: 25rem;
		border: 5px solid black;
		font-family: Verdana, Geneva, Tahoma, sans-serif;
		border-radius: 1rem;
	}
	
	.dark {
		background-color: #434343;
		color: white;
	}
	.container {
		display: flex;
		flex-direction: column;
	}
	.header {
		display: flex;
		flex-direction: row-reverse;
	}
	.close {
		cursor: pointer;
		background-color: white;
		border: none;
		width: 20px;
		margin-left: auto;
		margin-right: 10px;
		font-size: xx-large;
	}
	.dark-close {
		background-color: #434343;
	}
	.close:hover {
		color: red;
		font: bold;
	}
	.heading {
		font-size: 3em;
	}
	.add-opinion {
		display: flex;
		flex-direction: column;
		align-items: center;
	}
	.description {
		font-size: large;
		margin: 40px;
		align-items: center;
		width: 100%;
	}
</style>
