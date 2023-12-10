// import { schnorr } from 'noble-secp256k1';
// import { crypto } from 'bitcoinjs-lib';
// import { Buffer } from 'buffer';

// export async function signedEvent(event, privateKey) {
// 	let eventData = JSON.stringify([
// 		0,
// 		event['pubkey'],
// 		event['created_at'],
// 		event['kind'],
// 		event['tags'],
// 		event['content']
// 	]);
// 	event.id = crypto.sha256(Buffer.from(eventData)).toString('hex');
// 	event.sig = await schnorr.sign(event.id, privateKey);
// 	return event;
// }
