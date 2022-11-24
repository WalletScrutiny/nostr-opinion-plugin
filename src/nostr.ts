import { relayPool } from 'nostr-tools';

const nostr = relayPool();

nostr.addRelay('wss://relay.nostr.info', { read: true, write: true });

export default nostr;
