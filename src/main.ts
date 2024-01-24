// eslint-disable-next-line @typescript-eslint/no-unused-vars
import App from './App.svelte';

class ExpertOpinions {
	public trustedAuthors: string[];
	public headline: string = 'Community Opinions ($$nAll$$/$$nTrusted$$)';
	public description: string = 'These comments are contributed by nostr users using the nostr-opinions-plugin.';
	public newOpinionDescription: string = `<p>
	Thank you for contributing your opinion. Please make sure to follow these
	simple guidelines:
</p>
<ul>
	<li>Be objective</li>
	<li>Be polite</li>
</ul>`
}

export const expertOpinions = new ExpertOpinions();
