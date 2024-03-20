import NDK, { NDKEvent, type Hexpubkey, type NDKFilter } from '@nostr-dev-kit/ndk';
import { initializeApprovedAuthors } from './utils/approvedAuthors';

export default class Summariser {
	opinions: Record<string, NDKEvent[]>;
	ndk: NDK;
	trustedAuthors: Hexpubkey[];

	constructor({
		relay,
		trustedAuthors: trustedAuthors
	}: {
		relay: string;
		trustedAuthors: Hexpubkey[];
	}) {
		this.opinions = {};
		this.ndk = new NDK({ explicitRelayUrls: [relay] });
		this.trustedAuthors = trustedAuthors;
	}

	onReady = () => {
		return new Promise<void>((resolve, reject) => {
			this.ndk
				.connect()
				.then(async () => {
					this.trustedAuthors = await initializeApprovedAuthors();
					const ndkFilter: NDKFilter = { kinds: [30234 as number], authors: this.trustedAuthors };

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
				const current = curr.tags.find((tag) => tag[0] === 'sentiment')[1];
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
