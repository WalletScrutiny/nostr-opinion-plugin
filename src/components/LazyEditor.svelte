<script lang="ts">
	// The ToastUI editor (and ProseMirror underneath it) is by far the largest
	// part of this bundle, yet most visitors only read opinions. Load it as a
	// separate chunk the first time an editor is actually shown, so the main
	// nostr-opinion.js stays small.
	import { onMount } from 'svelte';
	import TextArea from './TextArea.svelte';

	type EditorComponent = typeof import('./Editor.svelte').default;

	export let opinionContent: string;
	export let fileArray: { files: File; url: string }[];

	let editorComponent: EditorComponent | null = null;
	let loadFailed = false;

	onMount(async () => {
		try {
			editorComponent = (await import('./Editor.svelte')).default;
		} catch (e) {
			console.error('nostr-opinion: could not load the editor, falling back to a plain textarea', e);
			loadFailed = true;
		}
	});
</script>

{#if editorComponent}
	<svelte:component this={editorComponent} bind:fileArray bind:opinionContent />
{:else if loadFailed}
	<TextArea bind:opinionContent />
{:else}
	<div class="editor-loading" aria-busy="true">Loading editor…</div>
{/if}

<style>
	.editor-loading {
		min-height: 300px;
		display: flex;
		align-items: center;
		justify-content: center;
		color: #888;
	}
</style>
