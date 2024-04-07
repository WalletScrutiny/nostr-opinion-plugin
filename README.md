# nostr opinion plugin

## Client side components

This plugin uses native web components.

### Dev Server

To start a dev server, run: `npm run dev`. You can configure the plugin by modifying the [index.js](index.js) file as [described below](#configuration)

### Building

To build the project, run `npm run build`.

### Configuration

The build command outputs a single JS file that can be used in any other JS project. You have three ways of configuring the plugin:

1. You can pass the pubkey or profile info of the users (starts with `npub` or `nprofile`) that you trust to write meaningful reviews or comments on your site.
2. You can [create and award badges](https://badges.page) to users that you trust instead of hardcoding their npubs, and then pass the identifier (starts with `naddr`) of that badge to the plugin.
3. You can create a dedicated nostr profile to award badges to users that you trust. The awardees of any badge created by these profile 

Here's an example

```html
<script type="module">
	import { expertOpinions } from '/src/nostr-opinion.js';
	
	// Case 1: John and Jane are trusted authors
	expertOpinions.trustedAuthors = [
		'npub1f70....2uvh', // John's hex pubkey
		'npub14we....jch3' // Jane's hex pubkey
	];

	// Case 2: A badge awarded to Alice, it makes Alice a trusted author
	expertOpinions.trustedBadges = [
		'naddr1qqx4....2qnm'
	];

	// Case 3: Bob's npub, all badges by Bob and the awardees who have accepted those badges will be considered trusted authors
	expertOpinions.trustedBadgeAuthors = [
		'nprofile1qqsd....l0vf'
	];
	
	expertOpinions.headline = 'Community Opinions ($$nTrusted$$/$$nAll$$)';
	expertOpinions.description = 'These comments are contributed by nostr users using the nostr-opinions-plugin.';

</script>
```

### Using as web component

Login:  
`<nostr-opinion-login></nostr-opinion-login>`

Nostr Opinion:  
`<nostr-opinion name="/android/com.mycelium.wallet/"></nostr-opinion>`

## Server side opinion summariser

Run on the server to compile overall sentiment of opinions

build: `npm run build:summariser`

example usage:

```ts
const Summariser = require('./nostr-opinion-summariser').default;

const summariser = new Summariser({
	relay: 'wss://relay.nostr.info',
	trustedAuthors: ['6a04ab98d9e4774ad806e302dddeb63bea16b5cb5f223ee77478e861bb583eb3'] // optional
});

await summariser.onReady();
summariser.get('/android/io.horizontalsystems.bankwallet/');
/*
  {
    positive: 203,
    neutral: 123,
    negative: 28
  }
*/
```
