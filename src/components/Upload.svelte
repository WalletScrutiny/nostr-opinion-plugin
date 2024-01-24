<script lang="ts">
	import { NDKlogin, privkeyLogin } from '../utils/helper';
	import ndk from '../stores/provider';
	import UploadButton from './icons/UploadButton.svelte';
	import { VoidApi } from '@void-cat/api';
	import { uploadUrl } from '../utils/constants';
	import { localStore } from '../stores/stores';
	import type { ChangeEventHandler } from 'svelte/elements';
	let fileInput: HTMLElement;
	let files;
	export let fileArray: { files: File; url: string }[] = [];
	export let opinionContent: string;
	const FILE_EXT_REGEX = /\.([\w]{1,7})$/i;

	const voidCatHost = uploadUrl;
	const voidCatApi = new VoidApi(voidCatHost);
	const handleChange: ChangeEventHandler<HTMLInputElement> = async (event) => {
		console.log(opinionContent);

		const inputElement = event.target as HTMLInputElement;

		if (!inputElement.files) {
			console.log('Files array is empty');
			return;
		}
		for (files of inputElement.files) {
			const privkey = $localStore.pk;
			if (privkey) {
				!$ndk.signer && (await privkeyLogin(privkey));
			} else {
				!$ndk.signer && (await NDKlogin());
			}
			const uploader = voidCatApi.getUploader(files);

			const response = await uploader.upload({
				'V-Strip-Metadata': 'true'
			});
			if (response.ok) {
				let ext = files.name.match(FILE_EXT_REGEX);
				if (response.file?.metadata?.mimeType === 'image/webp') {
					ext = ['', 'webp'];
				}
				const resultUrl =
					response.file?.metadata?.url ??
					`${voidCatHost}/d/${response.file?.id}${ext ? `.${ext[1]}` : ''}`;
				fileArray = [...fileArray, { files, url: resultUrl }];
				opinionContent = opinionContent + ' ' + resultUrl;
				console.log(opinionContent);
				console.log(fileArray);
			}
		}
	};
</script>

<input
	type="file"
	style="display:none"
	accept="image/*"
	bind:this={fileInput}
	on:change={handleChange}
/>
<button
	on:click|preventDefault={() => fileInput.click()}
	style="border: none;background-color:white;cursor:pointer"><UploadButton /></button
>
