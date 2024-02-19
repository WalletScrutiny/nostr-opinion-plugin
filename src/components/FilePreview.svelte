<script lang="ts">
	export let file: File;
	export let onDelete: (file: File) => void;

	let dataUrl = '';

	const reader = new FileReader();

	reader.onload = (event) => {
		if (typeof event?.target?.result === 'string') {
			dataUrl = event.target.result;
		}
	};

	if (file) {
		reader.readAsDataURL(file);
	}

	const handleDelete = () => {
		onDelete(file);
	};
</script>

<div class="preview-container">
	{#if dataUrl}
		<img
			class="preview-image"
			src={dataUrl}
			alt="Uploaded file preview"
		/>
		<button
			class="delete-button"
			on:click={handleDelete}>X</button
		>
	{/if}
</div>

<style>
	.preview-container {
		position: relative;
		width: 150px;
		height: 150px;
		border-radius: 10px;
		overflow: hidden;
		box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
	}

	.preview-image {
		width: 100%;
		height: 100%;
		display: block;
		border-radius: 10px;
	}

	.delete-button {
		position: absolute;
		top: 10px;
		right: 10px;
		background-color: transparent;
		border: none;
		border-radius: 50%;
		color: white;
		cursor: pointer;
	}
</style>
