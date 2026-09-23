# nostr opinion plugin

## Client side components

This plugin uses native web components.

### Dev Server

To start a dev server, run: `npm run dev`. You can configure the plugin by modifying the [index.js](index.js) file as [described below](#configuration)

### Building

To build the project, run `npm run build`.

The build writes two files into `dist/`:

- `nostr-opinion.js` — the plugin itself (web components, relay access, opinion viewer).
- `nostr-opinion-editor.js` — the ToastUI markdown editor. It is fetched by `nostr-opinion.js` on demand, the first time a visitor opens the "Add/Edit your opinion" form, via a relative `import('./nostr-opinion-editor.js')`.

Deploy both files side by side in the same directory. Only `nostr-opinion.js` needs to be referenced from the host page. If the editor file cannot be loaded, the form falls back to a plain textarea.

### Configuration

You have three ways of configuring the plugin:

1. You can pass the pubkey or profile info of the users (starts with `npub` or `nprofile`) that you trust to write meaningful reviews or comments on your site.
2. You can [create and award badges](https://badges.page) to users that you trust instead of hardcoding their npubs, and then pass the identifier (starts with `naddr`) of that badge to the plugin.
3. You can create a dedicated nostr profile to award badges to users that you trust. The awardees of any badge created by these profile will be considered as approved authors.

Here's an example

```html
<script type="module">
    const { expertOpinions } = await import('/assets/js/nostr-opinion.js');
</script>

<nostr-opinion
  subject="subject_to_get_opinions_about"
  subjects="optional,comma,separated,legacy,d-tags"
  opinionHeader="Header of the component"
  opinionFooter="Footer of the component"
  opinionTitle="Title of the component"
  opinionImage="Image to show"
  opinionTags="WalletScrutiny,nostrOpinion"
  expertOpinionsConfig='{
    "headline": "Headline of the component",
    "description": "Description of the component",
    "trustedAuthors": [ // optional
      "npub1xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx",
      "npub1yyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyy"
    ],
		"trustedBadgeAuthors": [  // optional nostr profiles. The awardees of any badge created by this profiles will be considered trusted authors, provided they have accepted that badge
			"nprofile1xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx",
			"nprofile1yyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyy"
		],
		"trustedBadges": [ // optional. a badge awarded to a user makes the user a trusted author
			"naddr1xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx",
		]
    }'>
></nostr-opinion>
```

`subject` is the canonical d-tag used when publishing new opinions. Optional `subjects` is a comma-separated list of additional d-tags to load (useful for legacy aliases after a subject rename). When the same author has opinions under more than one of those keys, the newest event is shown.

### Web components

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
