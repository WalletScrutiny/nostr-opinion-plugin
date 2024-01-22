<script lang="ts">
    import { onMount } from 'svelte';
	import { slide } from 'svelte/transition';

    let textarea;
    export let opinionContent;

    const updateContent = () => {
        opinionContent = textarea.value;
    };

    onMount(() => {
        textarea.value = opinionContent;
    });

    $: if (textarea) {
        textarea.value = opinionContent;
    }
</script>

<textarea  transition:slide bind:this={textarea}
          on:input={updateContent}
          placeholder="Reply" 
          style="
            width: 100%;
            height: 200px;
            background-color: #f8f8f8; 
            color: #333;
            border: 1px solid #ccc; 
            border-radius: 4px;
            padding: 10px;
            font-family: 'Arial', sans-serif;
            font-size: 16px;
            line-height: 1.5;
            resize: vertical;
            box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
            transition: border-color 0.3s, box-shadow 0.3s;
          ">
</textarea>
