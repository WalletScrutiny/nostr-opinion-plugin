# nostr opinion plugin

## Client side components

This plugin uses native web components

to start dev server: `npm run dev`

to build: `npm run build`

to use on another site:
`<script type="module" src="/dist/nostr-opinion.js"></script>`

login component:
`<nostr-opinion-login></nostr-opinion-login>`

opinion component:
`<nostr-opinion name="android/com.mycelium.wallet"></nostr-opinion>`

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
