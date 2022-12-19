<svelte:options tag="nostr-opinion" />

<script lang="ts">
	import { onMount } from 'svelte';
	import nostr from './nostr';
	import type { Event } from 'nostr-tools';
	import { activeProfile } from './stores';

	export let name: string;
	let expertOpinions;
	let events: Event[] = [];
	let newOpinion = {
		content: '',
		sentiment: '0'
	};

	const submit = async () => {
		if (!newOpinion.content || !$activeProfile) return;
		const eventObject: Event = {
			kind: 30234,
			content: newOpinion.content,
			tags: [
				['d', name],
				['sentiment', newOpinion.sentiment]
			],
			pubkey: $activeProfile.pubkey,
			created_at: Math.floor(Date.now() / 1000)
		};
		await nostr.publish(eventObject, () => {
			const index = events.findIndex((e) => e.pubkey === eventObject.pubkey);
			if (index !== -1) {
				events[index] = eventObject;
			} else {
				events = [eventObject, ...events];
			}
			sortEvents();
		});
	};

	const sortEvents = () => {
		events = events.sort((a, b) => {
			const aTrusted = expertOpinions.trustedAuthors.includes(a.pubkey);
			const bTrusted = expertOpinions.trustedAuthors.includes(b.pubkey);
			if (aTrusted && !bTrusted) return -1;
			if (!aTrusted && bTrusted) return 1;
			if (a.created_at > b.created_at) return -1;
			if (a.created_at < b.created_at) return 1;
			return 0;
		});
	};

	onMount(async () => {
		expertOpinions = (await import('./main')).expertOpinions;
		let eventCount = 0;
		const sub = nostr.sub({
			cb: (event, relay) => {
				events = [...events, event];
				eventCount += 1;
				if (eventCount > 5) {
					sub.unsub();
				}
				sortEvents();
			},
			filter: {
				kinds: [30234],
				'#d': [name]
			}
		});
		setTimeout(() => {
			sub.unsub();
		}, 5000);
	});
</script>

<h1>Opinions for {name}</h1>
{#each events as event}
	<div class="opinion-container">
		<p>
			From: {event.pubkey.slice(0, 7)}
			{#if expertOpinions.trustedAuthors.includes(event.pubkey)}
				<span class="trusted">Trusted Author</span>
			{/if}
		</p>
		<p>
			Content: {event.content}
		</p>
		<p>
			Sentiment: {(() => {
				const sentiment = event.tags.find((tag) => tag[0] === 'sentiment')?.[1];
				return `${sentiment} - ${
					sentiment === '-1' ? 'negative' : sentiment === '0' ? 'neutral' : 'positive'
				}`;
			})()}
		</p>
	</div>
	<hr />
{/each}
<h3>Create new opinion</h3>
<form on:submit|preventDefault={submit}>
	<label for="content">Content</label>
	<input id="content" type="text" bind:value={newOpinion.content} />
	<label for="sentiment">Sentiment</label>
	<select name="sentiment" id="sentiment" bind:value={newOpinion.sentiment}>
		<option value="-1">negative</option>
		<option value="0">neutral</option>
		<option value="1">positive</option>
	</select>
	<button type="submit" disabled={!$activeProfile}>Submit</button>
	{#if !$activeProfile}
		<span>not logged in</span>
	{/if}
</form>

<style>
	.trusted {
		color: #01b201;
	}
</style>
