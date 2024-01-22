import { bech32 } from 'bech32';

function hexToBytes(hex: string) {
	const bytes = new Uint8Array(hex.length / 2);
	for (let i = 0; i < bytes.length; i++) {
		bytes[i] = parseInt(hex.substring(i * 2, i * 2 + 2), 16);
	}
	return bytes;
}

export function convertNostrPubKeyToBech32(pubKeyHex: string, hrp = 'npub') {
	const bytes = hexToBytes(pubKeyHex);
	return bech32.encode(hrp, bech32.toWords(bytes));
}
