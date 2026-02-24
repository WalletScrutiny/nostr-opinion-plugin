<script lang="ts">
	import Editor from '@toast-ui/editor';
	import css from '@toast-ui/editor/dist/toastui-editor.css?inline';
	import dark from "@toast-ui/editor/dist/theme/toastui-editor-dark.css?inline";
	import { opinionFooterRegex, opinionHeaderRegex } from '../utils/constants';
	import { NDKlogin, privkeyLogin } from '../utils/helper';
	import ndk from '../stores/provider';
	import { VoidApi } from '@void-cat/api';
	import { uploadUrl } from '../utils/constants';
	import { localStore, theme } from '../stores/stores';

	export let opinionContent: string;
	export let fileArray: { files: File; url: string }[];

	let editor: InstanceType<typeof Editor> | null = null;
	let isInternalUpdate = false;
	const initialValueForEditor = opinionContent.replace(opinionHeaderRegex, '').replace(opinionFooterRegex, '');

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

	const uploadImage = async (files: File) => {
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
			fileArray = [...fileArray, { files: files, url: resultUrl }];
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

	function getData() {
		if (!editor) return;
		isInternalUpdate = true;
		opinionContent = editor.getMarkdown();
	}

	type EditorConfig = {
		initialValue: string;
		theme: string;
		setEditor: (e: InstanceType<typeof Editor> | null) => void;
		onContentChange: () => void;
		uploadImageFn: (f: File) => Promise<string>;
	};

	function createEditorInstance(node: HTMLElement, config: EditorConfig): InstanceType<typeof Editor> {
		return new Editor({
			el: node,
			height: '300px',
			initialEditType: 'markdown',
			previewStyle: 'tab',
			theme: config.theme,
			initialValue: config.initialValue,
			autofocus: true,
			events: {
				change: () => config.onContentChange()
			},
			hooks: {
				addImageBlobHook: async (blob: Blob, callback: (url: string, altText: string) => void) => {
					const url = await config.uploadImageFn(blob as File);
					if (url) callback(url, 'image');
				}
			},
			extendedAutolinks: true
		});
	}

	function editorAction(node: HTMLElement, config: EditorConfig) {
		if (!config) return;

		let styleEl: HTMLStyleElement | null = null;
		const root = node.getRootNode() as Document | ShadowRoot;
		if (root instanceof ShadowRoot || root === document) {
			styleEl = document.createElement('style');
			styleEl.setAttribute('data-toast-ui-editor-injected', '');
			styleEl.textContent = css + '\n' + dark;
			if (root instanceof ShadowRoot) {
				root.insertBefore(styleEl, root.firstChild);
			} else {
				document.head.appendChild(styleEl);
			}
		}

		let instance = createEditorInstance(node, config);
		config.setEditor(instance);

		return {
			update(newConfig: EditorConfig) {
				if (newConfig.theme !== config.theme) {
					instance.destroy();
					config.setEditor(null);
					instance = createEditorInstance(node, newConfig);
					newConfig.setEditor(instance);
					config = newConfig;
				}
			},
			destroy() {
				instance.destroy();
				config.setEditor(null);
				if (styleEl?.parentNode) styleEl.remove();
			}
		};
	}

	$: editorConfig = {
		initialValue: initialValueForEditor,
		theme: $theme,
		setEditor: (e: InstanceType<typeof Editor> | null) => (editor = e),
		onContentChange: getData,
		uploadImageFn: uploadImage
	};
</script>
<div id="toast-ui-editor-container" use:editorAction={editorConfig}></div>
