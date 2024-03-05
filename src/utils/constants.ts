import type { NDKKind } from '@nostr-dev-kit/ndk';
import type { ToastSettings } from '@skeletonlabs/skeleton';
export const profileImageUrl = 'https://api.dicebear.com/5.x/identicon/svg?seed=';
export const kindNotes = 1;
export const kindOpinion = 30023 as NDKKind;
export const kindDelete = 5;
export const kindReaction = 7;
export const kindUpload = 27235;
export const uploadUrl = 'https://void.cat';
export const toastTimeOut = 3500;
export const nostrBuildBaseApiKey =
	'26d075787d261660682fb9d20dbffa538c708b1eda921d0efa2be95fbef4910a';

export const succesPublishToast: ToastSettings = {
	message: 'Published successfully!',
	timeout: toastTimeOut,
	hoverable: true,
	background: 'variant-filled-success'
};

export const errorPublishToast: ToastSettings = {
	message: 'Error on publishing, look at console!',
	timeout: toastTimeOut,
	hoverable: true,
	background: 'variant-filled-error'
};
export const DEFAULT_RELAY_URLS = {
	read: [
		'wss://purplepag.es',
		'wss://relay.nostr.band',
		'wss://nos.lol',
		'wss://offchain.pub/',
		'wss://nostr-pub.wellorder.net',
		'wss://nostr.mutinywallet.com'
	],
	write: [
		'wss://purplepag.es',
		'wss://relay.nostr.band',
		'wss://nos.lol',
		'wss://offchain.pub/',
		'wss://nostr-pub.wellorder.net',
		'wss://nostr.mutinywallet.com '
	]
};
export const opinionHeaderSeparator = '\n<!--HEADER END-->\n';
export const opinionFooterSeparator = '\n<!--FOOTER START-->\n\n\n\n';
export const opinionHeaderRegex = new RegExp(`^[\\s\\S]*${opinionHeaderSeparator}`);
export const opinionFooterRegex = new RegExp(`${opinionFooterSeparator}[\\s\\S]*$`);
