<script lang="ts">
	import Viewer from "@toast-ui/editor/dist/toastui-editor-viewer";
    import css from "@toast-ui/editor/dist/toastui-editor-viewer.css?inline";
    import dark from "@toast-ui/editor/dist/theme/toastui-editor-dark.css?inline";
	import { onMount } from "svelte";
	import { theme } from "../stores/stores";

    let view: HTMLElement;
    let viewDark: HTMLElement;
    let viewer: Viewer;
    let viewerDark: Viewer;
    export let content: string;

    function initialize() {
      
        viewer = new Viewer({
            el: view,
            theme: 'light',
            initialValue: content,
        }); 
        
        viewerDark = new Viewer({
            el: viewDark,
            theme: "dark",
            initialValue: content
        })
    }

    $: if($theme && viewer && viewerDark && content) {
       viewer.destroy();
       viewerDark.destroy();
       initialize();
    }

	onMount(()=>{
		initialize();
	})
</script>

<!-- eslint-disable-next-line svelte/no-at-html-tags -->
<svelte:element this="style">{@html css}</svelte:element>
<!-- eslint-disable-next-line svelte/no-at-html-tags -->
<svelte:element this="style">{@html dark}</svelte:element>

<div bind:this={view} class:hidden={$theme === 'dark'}/>
<div bind:this={viewDark} class:hidden = {$theme === 'light'}/>

<style>
    .hidden { display: none; }
</style>