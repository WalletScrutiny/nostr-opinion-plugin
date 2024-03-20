type Bech32Prefix = 'npub' | 'nsec' | 'note';
type ShareableIdentifierPrefix = 'nprofile' | 'nevent' | 'nrelay' | 'naddr';

export type Nip19Entity = `${Bech32Prefix}${string}` | `${ShareableIdentifierPrefix}${string}`;
