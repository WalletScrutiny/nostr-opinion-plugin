<script lang="ts">
    import ndk from "../stores/provider";
    import { NDKlogin, privkeyLogin } from "./helper";
	import DeleteButton from "../components/icons/DeleteButton.svelte";
	import { db } from "@nostr-dev-kit/ndk-cache-dexie";
    import {  localStore } from '../stores/stores';

    export let eventID:string;
    export let isDeleted;
    export let count: number;

    async function deleteEventData(eventID:string) {
        try {
            const privkey = $localStore.pk;
		    if(privkey){
            !$ndk.signer && await privkeyLogin(privkey);
            } else {
                !$ndk.signer && await NDKlogin();
            }
            const ndkEvent = await $ndk.fetchEvent({ids:[eventID]});
            await db.events.delete(eventID);
            await ndkEvent?.delete();
            isDeleted = true;
            count = count == 0 ? 0: count - 1;
        } catch (error) {
            console.log("Error: ",error);
        }
    }
    
</script>


<div class="card-button">
    <button on:click={() => deleteEventData(eventID)}>
        <DeleteButton />
    </button>
</div>


<style>
    .card-button {
        display: inline-flex;
        align-items: center;
        gap: 2px;
    }

    .card-button button {
        background: none;
        border: none;
        cursor: pointer;
        display: flex;
        align-items: center;
        padding: 8px;
    }
</style>