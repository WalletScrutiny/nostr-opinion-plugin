<script lang="ts">
	import { onMount } from 'svelte';
	import Editor from '@toast-ui/editor';
	import css from '@toast-ui/editor/dist/toastui-editor.css?inline';
	import { opinionFooterRegex, opinionHeaderRegex } from '../utils/constants';
	import { NDKlogin, privkeyLogin } from '../utils/helper';
	import ndk from '../stores/provider';
	import { VoidApi } from '@void-cat/api';
	import { uploadUrl } from '../utils/constants';
	import { localStore } from '../stores/stores';


	export let opinionContent: string;
	export let fileArray;{ File; String }[];

	let container: HTMLElement;
	let editor: Editor;
	let isInternalUpdate = false;

	const FILE_EXT_REGEX = /\.([\w]{1,7})$/i;

	const voidCatHost = uploadUrl;
	const voidCatApi = new VoidApi(voidCatHost);

	const convertImageUrlsToMarkdown = (content: string) => {
		const imageUrlRegex = /(?<!\]\()https?:\/\/\S*\.(jpg|jpeg|png|gif|svg|webp)(?!\))/g;
		return content.replace(imageUrlRegex, (url) => {
			if (!url.startsWith('![](')) {
				return `![](${url})`;
			}
			return url;
		});
	};

	 const uploadImage = async (files:File | Blob) => {
		console.log(files);
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
			console.log(ext);
			if (response.file?.metadata?.mimeType === 'image/webp') {
				ext = ['', 'webp'];
			}
			const resultUrl =
				response.file?.metadata?.url ??
				`${voidCatHost}/d/${response.file?.id}${ext ? `.${ext[1]}` : ''}`;
			fileArray = [...fileArray, { files, url: resultUrl }];
			return resultUrl;
		}
		return '';
	};

	$: {
		if (editor && !isInternalUpdate) {
			const currentContent = editor.getMarkdown();
			if (opinionContent !== currentContent) {
				opinionContent = convertImageUrlsToMarkdown(opinionContent);
				editor.setMarkdown(opinionContent);
			}
		}
		isInternalUpdate = false;
	}

	const getData = () => {
		isInternalUpdate = true;
		opinionContent = editor.getMarkdown();
	};

	onMount(() => {
		opinionContent = opinionContent.replace(opinionHeaderRegex,"").replace(opinionFooterRegex,"");
		editor = new Editor({
			el: container,
			height: 'auto',
			initialEditType: 'markdown',
			previewStyle: 'tab',
			initialValue: opinionContent,
			theme:'dark',
			events: {
				change: function () {
					getData();
				},
			},
			hooks: {
				addImageBlobHook: async (blob, callback) => {
				const uploadedImageUrl = await uploadImage(blob);
				if (uploadedImageUrl) {
					callback(uploadedImageUrl, 'image');
				}
				},
			},
			extendedAutolinks: true,
		});

		editor.getMarkdown();
	});
</script>
<!-- eslint-disable-next-line svelte/no-at-html-tags -->
<svelte:element this="style">{@html css}</svelte:element>
<div bind:this={container} />