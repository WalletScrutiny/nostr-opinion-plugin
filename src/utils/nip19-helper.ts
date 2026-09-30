import * as nip19 from 'nostr-tools/nip19';

type Bech32Prefix = 'npub' | 'nsec' | 'note';
type ShareableIdentifierPrefix = 'nprofile' | 'nevent' | 'nrelay' | 'naddr';

export type Nip19Entity = `${Bech32Prefix}${string}` | `${ShareableIdentifierPrefix}${string}`;

/** Accepts a hex pubkey, an `npub` or an `nprofile` and returns the hex pubkey. */
export function toHexPubkey(entity: string): string | undefined {
	if (/^[0-9a-f]{64}$/i.test(entity)) {
		return entity.toLowerCase();
	}
	try {
		const decoded = nip19.decode(entity as Nip19Entity);
		if (decoded.type == 'npub') {
			return decoded.data;
		}
		if (decoded.type == 'nprofile') {
			return decoded.data.pubkey;
		}
	} catch {
		// Not a nip19 entity; ignore it rather than breaking the whole config.
	}
	return undefined;
}
