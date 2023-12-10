<script lang="ts">
	import { onMount } from 'svelte';
	import Editor from '@toast-ui/editor';
	import css from '@toast-ui/editor/dist/toastui-editor.css?inline';

	let container;
	let editor;
	export let opinionContent;

	const getData = () => {
        console.log(editor.getMarkdown());
		opinionContent = editor.getMarkdown();
	};

	onMount(() => {
		console.log(opinionContent);
		editor = new Editor({
			el: container,
			height: '200px',
			initialEditType: 'markdown',
			previewStyle: 'vertical',
			initialValue: opinionContent,
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

