<svelte:options tag="markdown-editor" />

<script lang="ts">
	import { onMount } from 'svelte';
	import Editor from '@toast-ui/editor';
	import css from '@toast-ui/editor/dist/toastui-editor.css';

	let container;
	let editor;
	export let newOpinion;

	const getData = () => {
		newOpinion.content = editor.getMarkdown();
	};

	onMount(() => {
		console.log(newOpinion);
		editor = new Editor({
			el: container,
			height: '400px',
			initialEditType: 'markdown',
			previewStyle: 'vertical',
			initialValue: newOpinion.content,
			events: {
				change: function (data) {
					getData();
				}
			}
		});

		editor.getMarkdown();
	});
</script>

<svelte:element this="style">{@html css}</svelte:element>
<div bind:this={container} />

<style>
</style>
