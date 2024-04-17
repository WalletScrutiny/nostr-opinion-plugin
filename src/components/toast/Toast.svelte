<script lang="ts">
	import { onDestroy } from 'svelte';
	import { toast } from '../../stores/stores';

	let showToast: boolean = false;
	let successToast: boolean = false;

	const unsub = toast.subscribe((tst) => {
		if (tst.type !== undefined && tst.type !== '') {
			successToast = tst.type === 'success';
			console.log(tst.type);
			showToast = true;
			setTimeout(() => toast.set({ type:"",message:""}), 3000);

		} else {
			showToast = false;
		}
	});
	onDestroy(unsub);
</script>

{#if showToast}
	<div>
		<div>
			<div class="toast-container">
				{#if successToast}
					<div class="toast">
						<p class="toastText">{$toast.message}</p>
						<button on:click={() => (showToast = false)} class="close">X</button>
					</div>
				{:else}
					<div class="errToast">
						<p class="toastText">{$toast.message}</p>
						<button on:click={() => (showToast = false)} class="close">X</button>
					</div>
				{/if}
			</div>
		</div>
	</div>
{/if}

<style>
	.toast-container {
		position: fixed;
		bottom: 0;
		right: 0;
		width: 100%;
		height: 100%;
		z-index: 10;
	}
	.toast {
		display: flex;
		flex-direction: row;
		position: fixed;
		bottom: 20px;
		right: -100%;
		background-color: green;
		justify-content: space-between;
		color: #fff;
		padding: 10px 20px;
		border-radius: 5px;
		box-shadow: 0 2px 5px rgba(0, 0, 0, 0.2);
		margin-bottom: 10px;
		max-width: 300px;
		overflow: hidden;

		animation: slideIn 0.5s forwards;
	}

	@keyframes slideIn {
		from {
			right: -100%;
		}
		to {
			right: 20px;
		}
	}
	.toastText {
		overflow: hidden;
		padding-right: 10px;
	}
	.errToast {
		display: flex;
		flex-direction: row;
		position: fixed;
		bottom: 20px;
		right: -100%;
		background-color: rgb(225, 50, 50);
		justify-content: space-between;
		color: #fff;
		padding: 10px 20px;
		border-radius: 5px;
		box-shadow: 0 2px 5px rgba(0, 0, 0, 0.2);
		margin-bottom: 10px;
		max-width: 300px;
		overflow: hidden;

		animation: slideIn 0.5s forwards;
	}

	@keyframes slideIn {
		from {
			right: -100%;
		}
		to {
			right: 20px;
		}
	}

	.close {
		background-color: transparent;
		box-shadow: none;
		border: none;
		color: white;
		font-size: larger;
		cursor: pointer;
	}
</style>
