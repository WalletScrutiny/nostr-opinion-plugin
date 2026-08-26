import { uploadUrl } from './constants';

export interface VoidCatUploadResult {
	ok: boolean;
	file?: {
		id?: string;
		metadata?: {
			url?: string;
			mimeType?: string;
		};
	};
}

async function sha256Hex(buffer: ArrayBuffer): Promise<string> {
	const digest = await crypto.subtle.digest('SHA-256', buffer);
	return Array.from(new Uint8Array(digest))
		.map((byte) => byte.toString(16).padStart(2, '0'))
		.join('');
}

export async function uploadToVoidCat(
	file: File,
	host: string = uploadUrl
): Promise<VoidCatUploadResult> {
	const digest = await sha256Hex(await file.arrayBuffer());
	const response = await fetch(`${host}/upload`, {
		method: 'POST',
		mode: 'cors',
		headers: {
			'Content-Type': 'application/octet-stream',
			'V-Content-Type': file.type || 'application/octet-stream',
			'V-Filename': file.name,
			'V-Full-Digest': digest,
			'V-Strip-Metadata': 'true'
		},
		body: file
	});
	if (!response.ok) {
		return { ok: false };
	}
	return await response.json();
}
