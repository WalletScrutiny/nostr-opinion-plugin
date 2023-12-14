
<script>
// @ts-nocheck
	import { NDKlogin } from '../utils/helper';
    import ndk from "../stores/provider";
    import UploadButton from './icons/UploadButton.svelte';
	import { NDKEvent } from '@nostr-dev-kit/ndk';
	import { kindUpload, nostrBuildBaseApiKey, uploadUrl } from '../utils/constants';
    let fileInput;
    let files;
    export let fileArray
    const handleChange=async (event)=>{
        for (files of event.target.files){;
            const method = "POST";
            !$ndk.signer && (await NDKlogin());
            const tags = [
                ['u', uploadUrl],
                ['method', method]
            ];
            const ndkEvent = new NDKEvent($ndk);
            ndkEvent.kind = kindUpload;
            ndkEvent.tags = tags;
            const formData = new FormData();
            formData.append("apikey",nostrBuildBaseApiKey);
            formData.append('publicgallery', files);
            const response = await fetch(uploadUrl, {
                body: formData,
                method
            });
            console.log(response.data);
            // await ndkEvent.publish();
            fileArray=[...fileArray,files] 
        }
        console.log(fileArray);
    }
</script>

<input type="file" style="display:none" bind:this={fileInput} on:change = {handleChange}/>
<button on:click={fileInput.click()} style="border: none;background-color:white;cursor:pointer"><UploadButton /></button>