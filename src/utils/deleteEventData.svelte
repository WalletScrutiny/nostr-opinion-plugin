<script lang="ts">
	import { NDKEvent } from "@nostr-dev-kit/ndk";
    import ndk from "../stores/provider";
    import { NDKlogin } from "./helper";
	import DeleteButton from "../components/icons/DeleteButton.svelte";
	import { db } from "@nostr-dev-kit/ndk-cache-dexie";

    export let eventID:string;
    export let isDeleted;
    export let count;

    async function deleteEventData(eventID:string) {
        try {
            !$ndk.signer && await NDKlogin();
            const ndkEvent = await $ndk.fetchEvent({ids:[eventID]});
            await db.events.delete(eventID);
            await ndkEvent.delete();
            isDeleted = true;
            count = count - 1;
        } catch (error) {
            console.log("Error: ",error);
        }
    }
    
</script>

<div class="card-button" style="display: inline-flex; align-items: center; gap: 2px;">
    <button on:click={() => {deleteEventData(eventID)}} style="background-color: transparent; border: none; cursor: pointer; display: flex; align-items: center; padding: 8px;">
        <DeleteButton />
    </button>
</div>
