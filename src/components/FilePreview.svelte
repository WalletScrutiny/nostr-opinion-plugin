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

<div
	style="position: relative; width: 150px; height:150px; border-radius: 10px; overflow: hidden; box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);"
>
	{#if dataUrl}
		<img
			style="width: 100%; height:100%; display: block; border-radius: 10px;"
			src={dataUrl}
			alt="Uploaded file preview"
		/>
		<button
			style="position: absolute; top: 10px; right: 10px; background-color: transparent; border: none; border-radius: 50%; color: white; cursor: pointer;"
			on:click={handleDelete}>X</button
		>
	{/if}
</div>
