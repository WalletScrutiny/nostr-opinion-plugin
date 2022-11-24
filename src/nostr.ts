import { relayPool } from 'nostr-tools';

const nostr = relayPool();

nostr.addRelay('ws://127.0.0.1:8008', { read: true, write: true });

export default nostr;
