import NDK, { NDKEvent, type Hexpubkey, type NDKFilter, type Npub } from '@nostr-dev-kit/ndk';
import { kindOpinion } from './utils/constants';
import { nip19 } from 'nostr-tools';

export default class Summariser {
	opinions: Record<string, NDKEvent[]>;
	ndk: NDK;
	trustedAuthors: Hexpubkey[] = [];

	constructor({ relay, trustedAuthors }: { relay: string; trustedAuthors: Npub[] }) {
		this.opinions = {};
		this.ndk = new NDK({ explicitRelayUrls: [relay] });
		// TODO: remove this and use initializeApprovedAuthors() instead
		this.trustedAuthors = trustedAuthors
			.map((author) => {
				const decoded = nip19.decode(author);
				if (decoded.type == 'npub') {
					return decoded.data;
				}
				if (decoded.type == 'nprofile') {
					return decoded.data.pubkey;
				}
			})
			.filter((hexKey): hexKey is string => hexKey != undefined);

		globalThis.WebSocket = require('ws');
	}

	onReady = () => {
		return new Promise<void>((resolve, reject) => {
			this.ndk
				.connect()
				.then(async () => {
					const ndkFilter: NDKFilter = { kinds: [kindOpinion], authors: this.trustedAuthors };
					return this.ndk.fetchEvents(ndkFilter, { closeOnEose: true });
				})
				.then((fetchEvents) => {
					fetchEvents.forEach((event) => {
						const d = event.tags.find((tag) => tag[0] === 'd')[1];
						this.opinions[d] = [...(this.opinions?.[d] || []), event];
					});
					resolve();
				})
				.catch((err) => reject(err));
		});
	};

	get(key: string) {
		const ops = this.opinions[key];

		if (!ops)
			return {
				positive: 0,
				neutral: 0,
				negative: 0
			};

		const counts = ops.reduce(
			(acc, curr) => {
				const current = curr.tags.find((tag) => tag[0] === 'sentiment')?.[1];
				if (!current) {
					return acc;
				}
				const k = current === '1' ? 'positive' : current === '0' ? 'neutral' : 'negative';
				acc[k] = (acc[k] || 0) + 1;
				return acc;
			},
			{
				positive: 0,
				neutral: 0,
				negative: 0
			}
		);

		return counts;
	}
}
