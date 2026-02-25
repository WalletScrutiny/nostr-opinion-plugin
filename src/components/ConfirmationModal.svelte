<script lang="ts">
    import { fly } from 'svelte/transition';
    import { fade } from 'svelte/transition';

    let { onAgreeButton, onCancelButton } = $props();
</script>

<div class="modal-overlay" transition:fade={{ duration: 400 }}>
    <div class="modal" transition:fly={{ y: 300, duration: 300, delay: 0 }}>
        <p>Are you sure you want to display all opinions?</p>
        <p>⚠️ Viewer discretion advised.</p>
        <button class="primary-btn" onclick={onAgreeButton}>Agree</button>
        <button class="primary-btn" onclick={onCancelButton}>Cancel</button>
    </div>
</div>

<style>
     .modal-overlay {
        position: fixed;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        background-color: rgba(0, 0, 0, 0.5);
        display: flex;
        justify-content: center;
        align-items: center;
        z-index: 2;
    }

    .modal {
        background-color: var(--neutral-6, white);
        color: var(--neutral-0, black);
        border: 1px solid var(--neutral-7);
        padding: 20px;
        border-radius: 5px;
        display: flex;
        flex-direction: column;
        gap: 10px;
    }

    .primary-btn {
        color: #ffffff;
        background-color: #3e8b0a;
        padding: 7px 20px;
        border-radius: 3px;
        cursor: pointer;
        border: none;
        height: 2.5rem;
    }
</style>
