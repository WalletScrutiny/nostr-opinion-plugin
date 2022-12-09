import type { Event, RelayPool } from 'nostr-tools';
import { relayPool } from 'nostr-tools';

export default class Summariser {
	opinions: Record<string, Event[]>;
	pool: RelayPool;
	trustedAuthors: string[];

	constructor({
		relay,
		trustedAuthors: trustedAuthors
	}: {
		relay: string;
		trustedAuthors?: string[];
	}) {
		this.opinions = {};
		this.pool = relayPool();
		this.pool.addRelay(relay, { read: true, write: false });
		this.trustedAuthors = trustedAuthors;
	}

	onReady = () =>
		new Promise<void>((resolve) => {
			const sub = this.pool.sub({
				cb: (event, relay) => {
					const d = event.tags.find((tag) => tag[0] === 'd')[1];

					this.opinions[d] = [...(this.opinions?.[d] || []), event];
				},
				filter: {
					kinds: [30234],
					authors: this.trustedAuthors
				}
			});
			setTimeout(() => {
				sub.unsub();
				resolve();
			}, 2000);
		});

	get(key: string) {
		const ops = this.opinions[key];

		if (!ops)
			return {
				sentiment: 'neutral',
				count: 0
			};

		const counts = ops.reduce((acc, curr) => {
			const current = curr.tags.find((tag) => tag[0] === 'sentiment')[1];
			const k = current === '1' ? 'positive' : current === '0' ? 'neutral' : 'negative';
			acc[k] = (acc[k] || 0) + 1;
			return acc;
		}, {});

		const mostCommon = Object.keys(counts).reduce((a, b) => {
			return counts[a] > counts[b] ? a : b;
		});
		return {
			sentiment: mostCommon,
			count: ops.length
		};
	}
}
