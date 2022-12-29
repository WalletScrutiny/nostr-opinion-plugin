<svelte:options tag="nostr-opinion" />

<script lang="ts">
	import { onMount } from 'svelte';
	import type { Event } from 'nostr-tools';
	import { activeProfile } from './stores';
	import Positive from './components/icons/Positive.svelte';
	import Neutral from './components/icons/Neutral.svelte';
	import Negative from './components/icons/Negative.svelte';
	import ApprovedBadge from './components/icons/ApprovedBadge.svelte';

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

<h1>Community opinions ({events.length ? events.length : ''})</h1>
<p class="description">
	These comments are contributed by members of the Wallet Scrutiny community like you. Thank you for
	helping review wallets for security issues and enabling more people to secure and custody their
	bitcoin.
</p>
{#if loading}
	<p>Loading...</p>
{:else}
	<nav class="top-nav">
		<div class="count-container">
			<span class="nav-count"><Positive /> 6 positive</span>
			<span class="nav-count"><Neutral /> 3 neutral</span>
			<span class="nav-count"><Negative /> 10 negative</span>
		</div>
		<div class="sort-container">
			<span>Approved</span>
			<span>All opinions</span>
		</div>
	</nav>
	{#each events as event}
		<div class="opinion-container">
			<div class="opinion-top">
				<p class="pubkey">
					{#if event.tags.find((tag) => tag[0] === 'sentiment')?.[1] === '-1'}
						<Negative />
					{:else if event.tags.find((tag) => tag[0] === 'sentiment')?.[1] === '0'}
						<Neutral />
					{:else}
						<Positive />
					{/if}
					{#if profiles[event.pubkey]}
						<strong>{profiles[event.pubkey]}</strong>
					{/if}
					{event.pubkey.slice(0, 7)}
					{#if expertOpinions.trustedAuthors.includes(event.pubkey)}
						<ApprovedBadge />
					{/if}
				</p>
				<p class="date">
					{new Date(event.created_at * 1000).toLocaleDateString()}
				</p>
			</div>
			<p class="content">
				{event.content}
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
	:host {
		--border-color: #dedede;
		--content-text-color: #606060;
		--pubkey-text-color: #000000;
		--date-text-color: #808080;
		--description-text-color: #808080;
		font-family: 'Lato';
	}
	h1 {
		margin: 5px 0;
	}
	hr {
		height: 1px;
		background-color: var(--border-color);
		border: none;
	}
	.content {
		color: var(--content-text-color);
		margin: 2px 0 10px 0;
	}
	.pubkey {
		color: var(--pubkey-text-color);
		font-weight: 600;
		display: flex;
		align-items: center;
		gap: 10px;
		margin: 2px 0;
	}
	.date {
		font-style: italic;
		color: var(--date-text-color);
	}
	.top-nav {
		display: flex;
		justify-content: space-between;
		border-top: var(--border-color) 1px solid;
		border-bottom: var(--border-color) 1px solid;
		padding: 20px 0;
	}
	.nav-count {
		display: flex;
		align-items: center;
	}
	.count-container {
		display: flex;
		flex-direction: row;
		color: var(--content-text-color);
	}
	.opinion-top {
		display: flex;
		justify-content: space-between;
	}
	.description {
		color: var(--description-text-color);
		margin: 10px 0;
	}
</style>
