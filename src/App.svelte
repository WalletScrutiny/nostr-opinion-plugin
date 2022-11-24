<script lang="ts">
  import { onMount } from 'svelte';
  import nostr from './nostr';
  import { generatePrivateKey, getPublicKey } from 'nostr-tools';
  import type { Event } from 'nostr-tools';
  import { activeProfile } from './stores';

  export let name: string;
  let events = [];
  let newOpinion = {
    content: '',
    sentiment: '0',
  };

  const submit = async () => {
    const eventObject: Event = {
      kind: 30234,
      content: newOpinion.content,
      tags: [
        ['d', name],
        ['sentiment', newOpinion.sentiment],
      ],
      pubkey: $activeProfile.pubkey,
      created_at: Math.floor(Date.now() / 1000),
    };
    await nostr.publish(eventObject, (status, url) => {
      if (status === 0) {
        console.log(`publish request sent to ${url}`);
      }
      if (status === 1) {
        console.log(`event published by ${url}`);
      }
    });
  };

  onMount(() => {
    let eventCount = 0;
    const sub = nostr.sub({
      cb: (event, relay) => {
        events = [...events, event];
        eventCount += 1;
        if (eventCount > 10) {
          sub.unsub();
        }
      },
      filter: {
        kinds: [30234],
        '#d': [name],
      },
    });
  });
</script>

<h1>Opinions for {name}</h1>
<form on:submit|preventDefault={submit}>
  <label for="content">Content</label>
  <input id="content" type="text" bind:value={newOpinion.content} />
  <label for="sentiment">Sentiment</label>
  <select name="sentiment" id="sentiment" bind:value={newOpinion.sentiment}>
    <option value="-1">negative</option>
    <option value="0">neutral</option>
    <option value="1">positive</option>
  </select>
  <button type="submit">Submit</button>
</form>
{#each events as event}
  <div class="opinion-container">
    <p>From: {event.pubkey.slice(0, 7)}</p>
    <p>
      Content: {event.content}
    </p>
    <p>
      Sentiment: {(() => {
        const sentiment = event.tags.find((tag) => tag[0] === 'sentiment')?.[1];
        return `${sentiment} - ${
          sentiment === '-1'
            ? 'negative'
            : sentiment === '0'
            ? 'neutral'
            : 'positive'
        }`;
      })()}
    </p>
  </div>
  <hr />
{/each}

<style>
  h1 {
    color: red;
  }
</style>
