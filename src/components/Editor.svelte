<script lang="ts">
	import { onMount } from 'svelte';
	import Editor from '@toast-ui/editor';
	import css from '@toast-ui/editor/dist/toastui-editor.css?inline';

	let container;
	let editor;
	export let opinionContent;
	let isInternalUpdate = false;

	const convertImageUrlsToMarkdown = (content) => {
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
	};

	onMount(() => {
		opinionContent = opinionContent.split("<!--HEADER END-->\n")?.[1]?.split("\n<!--FOOTER START-->")?.[0] || opinionContent;
		editor = new Editor({
			el: container,
			height: '200px',
			initialEditType: 'markdown',
			previewStyle: 'tab',
			initialValue: opinionContent,
			theme:'dark',
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
