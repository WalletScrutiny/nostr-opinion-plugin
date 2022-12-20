<svelte:options tag="nostr-opinion" />

<script lang="ts">
	import { onMount } from 'svelte';
	import type { Event } from 'nostr-tools';
	import { activeProfile } from './stores';

	export let name: string;
	let expertOpinions: typeof import('./main').expertOpinions;
	let events: Event[] = [];
	let profiles: Record<string, Event> = {};
	let newOpinion = {
		content: '',
		sentiment: '0'
	};
	let loading = true;

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
		await expertOpinions.nostr.publish(eventObject, () => {
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
		await expertOpinions.onReady;
		loading = false;

		const sub = expertOpinions.nostr.sub(
			{
				cb: (event) => {
					events = [...events, event];
					console.log(events);
					let sub2 = expertOpinions.nostr.sub(
						{
							cb: (event2) => {
								const content = JSON.parse(event2.content);
								profiles[event.pubkey] = content.name;
							},
							filter: {
								kinds: [0],
								authors: [event.pubkey],
								limit: 1
							}
						},
						null,
						() => {
							sub2.unsub();
						}
					);
				},
				filter: {
					kinds: [30234],
					'#d': [name],
					limit: 5
				}
			},
			null,
			// EOSE
			() => {
				sortEvents();
				sub.unsub();
			}
		);
	});
</script>

<h1>Opinions for {name}</h1>
{#if loading}
	<p>Loading...</p>
{:else}
	{#each events as event}
		<div class="opinion-container">
			<p>
				From:
				<strong>{profiles[event.pubkey] || ''}</strong>
				({event.pubkey.slice(0, 7)})
				{#if expertOpinions.trustedAuthors.includes(event.pubkey)}
					<span class="trusted">Trusted Author</span>
				{/if}
			</p>
			<p>
				Sentiment: {(() => {
					const sentiment = event.tags.find((tag) => tag[0] === 'sentiment')?.[1];
					return `${
						sentiment === '-1' ? 'Negative 🙁' : sentiment === '0' ? 'Neutral 😐' : 'Positive 🙂'
					}`;
				})()}
			</p>
			<p class="content">
				{event.content}
			</p>
			<p class="date">
				{new Date(event.created_at * 1000).toLocaleDateString()}
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
{/if}

<style>
	.trusted {
		color: #01b201;
	}
	.content {
		font-size: 1.3rem;
	}
	.date {
		font-size: 0.8rem;
	}
</style>
