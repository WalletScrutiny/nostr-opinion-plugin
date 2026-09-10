// eslint-disable-next-line @typescript-eslint/no-unused-vars
import App from './App.svelte';
import { type Nip19Entity } from './utils/nip19-helper';
import type { Hexpubkey } from '@nostr-dev-kit/ndk';

// Create the type for ExpertOpinions
export type ExpertOpinionsType = {
	headline: string;
	description: string;
	newOpinionDescription: string;
	trustedAuthors: Hexpubkey[];
	trustedBadgeAuthors: Nip19Entity[];
	trustedBadges: Nip19Entity[];
	/** Event ids of opinions that are never rendered (spam). */
	blockedEventIds: string[];
	/** Authors whose opinions are never rendered (spam), as `npub` or hex pubkey. */
	blockedAuthors: string[];
};

class ExpertOpinions implements ExpertOpinionsType {
	public headline: string = 'Community Opinions ($$nTrusted$$/$$nAll$$)';
	public description: string =
		'These comments are contributed by nostr users using the nostr-opinions-plugin.';
	public newOpinionDescription: string = `<p>
	Thank you for contributing your opinion. Please make sure to follow these
	simple guidelines:
</p>
<ul>
	<li>Be objective</li>
	<li>Be polite</li>
</ul>`;
	public trustedAuthors: Hexpubkey[] = [];
	public trustedBadgeAuthors: Nip19Entity[] = [];
	public trustedBadges: Nip19Entity[] = [];
	public blockedEventIds: string[] = [];
	public blockedAuthors: string[] = [];
}

export const expertOpinions = new ExpertOpinions();
