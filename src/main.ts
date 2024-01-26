// eslint-disable-next-line @typescript-eslint/no-unused-vars
import App from './App.svelte';
import { type Nip19Entity } from './utils/nip19-helper';

class ExpertOpinions {
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
	public trustedAuthors: Nip19Entity[] = [];
	public trustedBadgeAuthors: Nip19Entity[] = [];
	public trustedBadges: Nip19Entity[] = [];
}

export const expertOpinions = new ExpertOpinions();
