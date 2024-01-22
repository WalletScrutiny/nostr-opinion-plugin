<script lang="ts">
	import { onMount } from 'svelte';
	import Editor from '@toast-ui/editor';
	import css from '@toast-ui/editor/dist/toastui-editor.css?inline';

	let container: HTMLElement;
	let editor: Editor;
	export let opinionContent: string;
	let isInternalUpdate = false;

	const convertImageUrlsToMarkdown = (content: string) => {
		// This regex matches URLs that are not already part of Markdown image syntax
		const imageUrlRegex = /(?<!\]\()https?:\/\/\S*\.(jpg|jpeg|png|gif|svg|webp)(?!\))/g;
		return content.replace(imageUrlRegex, (url) => {
			// Replace only if the URL is not already in Markdown image format
			if (!url.startsWith('![](')) {
				return `![](${url})`;
			}
			return url;
		});
	};

	$: {
		if (editor && !isInternalUpdate) {
			const currentContent = editor.getMarkdown();
			if (opinionContent !== currentContent) {
				opinionContent = convertImageUrlsToMarkdown(opinionContent);
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
			previewStyle: 'tab',
			initialValue: opinionContent,
			placeholder: 'Enter your opinion',
			theme: 'dark',
			events: {
				change: function () {
					getData();
				}
			}
		});

		editor.getMarkdown();
	});
</script>

<!-- TODO: Fix this later. Using @html can enable XSS attacks -->
<!-- eslint-disable-next-line svelte/no-at-html-tags -->
<svelte:element this="style">{@html css}</svelte:element>
<div bind:this={container} />

<style>
</style>
