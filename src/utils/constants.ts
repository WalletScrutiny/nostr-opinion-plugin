import type { NDKKind } from '@nostr-dev-kit/ndk';
import type { ToastSettings } from '@skeletonlabs/skeleton';
export const profileImageUrl = 'https://api.dicebear.com/5.x/identicon/svg?seed=';
export const kindNotes = 1;
export const kindOpinion = 30234 as NDKKind;
export const kindDelete = 5;
export const kindReaction = 7;
export const toastTimeOut = 3500;
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
