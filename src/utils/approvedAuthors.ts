import { NDKKind, type Hexpubkey } from '@nostr-dev-kit/ndk';
import { get as getStore } from 'svelte/store';
import ndkStore from '../stores/provider';
import { nip19 } from 'nostr-tools';
import type { ExpertOpinionsType } from '../main';

export async function initializeApprovedAuthors(
	expertOpinions: ExpertOpinionsType
): Promise<Hexpubkey[]> {
	try {
		let trustedAuthors: Hexpubkey[] = [];
		trustedAuthors = expertOpinions.trustedAuthors
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

		const trustedBadgeAuthors = expertOpinions.trustedBadgeAuthors
			.map((badgeAuthor) => {
				const decoded = nip19.decode(badgeAuthor);
				if (decoded.type == 'npub') {
					return decoded.data;
				}
				if (decoded.type == 'nprofile') {
					// TODO: Add profile's relays to the list of relays to check
					return decoded.data.pubkey;
				}
			})
			.filter((hexKey): hexKey is string => hexKey != undefined);

		const trustedBadges: string[] = expertOpinions.trustedBadges
			.map((badge) => {
				const decoded = nip19.decode(badge);
				if (decoded.type == 'naddr' && decoded.data.kind == NDKKind.BadgeDefinition) {
					return `${decoded.data.kind}:${decoded.data.pubkey}:${decoded.data.identifier}`;
				}
			})
			.filter((hexKey): hexKey is string => hexKey != undefined);

		const $ndk = getStore(ndkStore);

		await $ndk.connect();

		const badgesByTrustedBadgeAuthors = await $ndk.fetchEvents({
			kinds: [NDKKind.BadgeDefinition],
			authors: trustedBadgeAuthors
		});

		badgesByTrustedBadgeAuthors.forEach((value) => {
			const dTag = value.tags.find((tag) => tag[0] == 'd');
			if (dTag) {
				trustedBadges.push(`${value.kind}:${value.pubkey}:${dTag[1]}`);
			}
		});

		const badgeAwardees: string[] = [];

		(
			await $ndk.fetchEvents({
				kinds: [NDKKind.BadgeAward],
				'#a': trustedBadges
			})
		).forEach((award) => {
			const pTags = award.tags.filter((tag) => tag[0] == 'p');
			if (pTags.length) {
				pTags.forEach((p) => badgeAwardees.push(p[1]));
			}
		});

		trustedAuthors.push(...badgeAwardees);
		expertOpinions.trustedAuthors.push(...trustedAuthors.map((author) => nip19.npubEncode(author)));
		return trustedAuthors;
	} catch (error) {
		console.log(error);
		return [];
	}
}
