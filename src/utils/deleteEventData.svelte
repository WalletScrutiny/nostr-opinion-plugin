<script lang="ts">
	import { NDKEvent } from "@nostr-dev-kit/ndk";
    import ndk from "../stores/provider";
    import { NDKlogin } from "./helper";

    export let eventToPublish:NDKEvent;

    async function deleteEventData(eventToPublish:NDKEvent) {
        try {
            !$ndk.signer && await NDKlogin();
            const ndkEvent = new NDKEvent($ndk);
            ndkEvent.kind = eventToPublish.kind;
            ndkEvent.tags = [["d",eventToPublish.tagValue("d")]];
            await ndkEvent.publish();
            await ndkEvent.delete();
        } catch (error) {
            console.log("Error: ",error);
        }
    }
    
</script>

<button on:click={()=>deleteEventData(eventToPublish)} 
    style="background-color: red; color: white; border: none; padding: 10px 20px; text-align: center; 
           text-decoration: none; display: inline-block; font-size: 16px; margin: 4px 2px; cursor: pointer; 
           border-radius: 5px; transition: background-color 0.3s ease;">
    Delete
</button>
