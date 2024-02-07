<script>
    import Login from './Login.svelte';
    import Register from './Register.svelte';
    export let show = false; // To control the visibility of the form
    export let mode = 'login'; // Can be 'login' or 'register'
</script>

{#if show}
<div class="floating-form-container"> 

    {#if mode === 'login'}
        <Login />
    {:else}
        <Register />
    {/if}
</div>
{/if}
<style>
    .floating-form-container {
        position: fixed;
        bottom: 20px; /* Adjust as needed */
        right: 20px; /* Adjust as needed */
        width: auto; /* Adjust as needed */
        max-width: 250px;
        background-color: #f5deb3;
        box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
        border-radius: 8px;
        padding: 20px;
        z-index: 1000; /* Ensure it floats above other content */
        display: flex;
        flex-direction: column;
        align-items: center;
        justify-content: center;
        overflow: auto;
        max-height: 180vh;
    }
    .primary-btn {
        color: var(--button-text-color);
        background-color: var(--button-background-color);
        padding: 7px 20px;
        border-radius: 3px;
        cursor: pointer;
        border: none;
        height: 2.5rem;
        font-family: inherit; /* Use the font from the parent or specify your own */
        font-size: 1rem; /* Adjust as needed */
        width: auto; /* Adjust as needed */
        margin: 0; /* Override any default margins if necessary */
        display: flex; /* To center the text vertically */
        align-items: center;
        justify-content: center;
    }
    .primary-btn:hover {
        background-color: darken(var(--button-background-color), 10%);
    }
   
</style>
