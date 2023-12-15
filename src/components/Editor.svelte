<script lang="ts">
	import { onMount } from 'svelte';
	import Editor from '@toast-ui/editor';
	import css from '@toast-ui/editor/dist/toastui-editor.css?inline';

	let container;
	let editor;
	export let opinionContent;
	let isInternalUpdate = false;

	$: {
        if (editor && !isInternalUpdate) {
            const currentContent = editor.getMarkdown();
            if (opinionContent !== currentContent) {
                editor.setMarkdown(opinionContent);
            }
        }
        isInternalUpdate = false; 
    }


	const getData = () => {
		isInternalUpdate = true;
		opinionContent = editor.getMarkdown();
		console.log(opinionContent);
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

