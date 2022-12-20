# nostr opinion plugin

## Client side components

This plugin uses native web components

to start dev server: `npm run dev`

to build: `npm run build`

to use on another site:

```html
<script type="module">
	import { expertOpinions } from '/src/nostr-opinion.js';
	expertOpinions.setRelay(); // pass in optional relay url
	expertOpinions.trustedAuthors = [
		'8d57446448a2fea22be1fcf7e526b87e917999ffc83ef5c6823a757fb58527f4',
		'64c9e18a36a04803111d21abae88d315f44d3235a4997101d8e2dff3dc82dd70'
	]; // optional
	expertOpinions.setReady(); // required
</script>
```

login component:
`<nostr-opinion-login></nostr-opinion-login>`

opinion component:
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
