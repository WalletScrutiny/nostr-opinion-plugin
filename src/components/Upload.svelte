<script>
	import { NDKlogin } from '../utils/helper';
    import ndk from "../stores/provider";
    import UploadButton from './icons/UploadButton.svelte';
    import { VoidApi } from "@void-cat/api";
    import { uploadUrl } from "../utils/constants"
    import { localStore } from '../stores/stores';
    let fileInput;
    let files;
    export let fileArray
    export let opinionContent;
    const FILE_EXT_REGEX = /\.([\w]{1,7})$/i;

    const voidCatHost = uploadUrl;
    const voidCatApi = new VoidApi(voidCatHost);
    const handleChange=async (event)=>{
        console.log(opinionContent);
        for (files of event.target.files){
            const privkey = $localStore.pk;
		    if(privkey){
            !$ndk.signer && await privkeyLogin(privkey);
            } else {
                !$ndk.signer && await NDKlogin();
            }
            const uploader = voidCatApi.getUploader(files);

            const response = await uploader.upload({
                "V-Strip-Metadata": "true",
            });
            if (response.ok) {
                let ext = files.name.match(FILE_EXT_REGEX);
                if (response.file?.metadata?.mimeType === "image/webp") {
                ext = ["", "webp"];
                }
                const resultUrl =
                response.file?.metadata?.url ??
                `${voidCatHost}/d/${response.file?.id}${ext ? `.${ext[1]}` : ""}`;
                fileArray=[...fileArray,{files,url: resultUrl}];
                opinionContent = opinionContent + " "+ resultUrl;
                console.log(opinionContent);
                console.log(fileArray);
            }
        }
    }
</script>

<input type="file" style="display:none" accept="image/*" bind:this={fileInput} on:change = {handleChange}/>
<button on:click|preventDefault={fileInput.click()} style="border: none;background-color:white;cursor:pointer"><UploadButton /></button>