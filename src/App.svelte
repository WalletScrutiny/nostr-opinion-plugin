<svelte:options tag="nostr-opinion" />

<script lang="ts">
	import { onMount } from 'svelte';
	import type { Event } from 'nostr-tools';
	import { activeProfile } from './stores';
	import Positive from './components/icons/Positive.svelte';
	import Neutral from './components/icons/Neutral.svelte';
	import Negative from './components/icons/Negative.svelte';
	import ApprovedBadge from './components/icons/ApprovedBadge.svelte';
	import Register from './components/Register.svelte';
	import Login from './components/Login.svelte';
	import Editor from './components/Editor.svelte';
	import { marked } from 'marked';

	export let name: string;
	let expertOpinions: typeof import('./main').expertOpinions;
	let allEvents: Event[] = [];
	let filteredEvents: Event[] = [];
	let profiles: Record<string, Event> = {};
	let newOpinion = {
		content: '',
		sentiment: '0'
	};
	let loading = true;
	let sentimentCount = {
		'-1': 0,
		'0': 0,
		'1': 0
	};
	let filter: 'approved' | 'all' = 'approved';
	let showNewOpinion = false;
	let showLoginOrRegister: 'login' | 'register' | false = false;

	const submit = async () => {
		if (!newOpinion.content || !$activeProfile) return;
		let eventObject: Event = {
			kind: 30234,
			content: newOpinion.content,
			tags: [
				['d', name],
				['sentiment', newOpinion.sentiment]
			],
			pubkey: $activeProfile.pubkey,
			created_at: Math.floor(Date.now() / 1000)
		};
		if (!$activeProfile.privkey && (await window.nostr.getPublicKey()) === $activeProfile.pubkey) {
			eventObject = await window.nostr.signEvent(eventObject);
		}
		await expertOpinions.nostr.publish(eventObject, () => {
			const index = allEvents.findIndex((e) => e.pubkey === eventObject.pubkey);
			if (index !== -1) {
				allEvents[index] = eventObject;
			} else {
				allEvents = [eventObject, ...allEvents];
			}
			sortEvents();
		});
	};

	const sortEvents = () => {
		sentimentCount = {
			'-1': 0,
			'0': 0,
			'1': 0
		};
		filteredEvents = allEvents.filter((e) => {
			if (filter === 'approved') {
				const trusted = expertOpinions.trustedAuthors.includes(e.pubkey);
				if (!trusted) return false;
			}
			const sentiment = e.tags.find((t) => t[0] === 'sentiment')?.[1];
			if (sentiment) sentimentCount[sentiment] += 1;
			return true;
		});
		filteredEvents = filteredEvents.sort((a, b) => {
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
					allEvents = [...allEvents, event];
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
					limit: 20
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

	const logout = () => {
		activeProfile.set(null);
		localStorage.removeItem('activeProfile');
	};
</script>

<h1>Community opinions ({allEvents?.length || '0'})</h1>
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
			<span class="nav-count"><Positive /> {sentimentCount['1']} positive</span>
			<span class="nav-count"><Neutral /> {sentimentCount['0']} neutral</span>
			<span class="nav-count"><Negative /> {sentimentCount['-1']} negative</span>
		</div>
		<div class="filter-container">
			<button
				class="blank-btn filter-btn"
				class:filter-active={filter === 'approved'}
				aria-label="filter by approved"
				on:click={() => (filter = 'approved') && sortEvents()}>Approved</button
			>
			<button
				class="blank-btn filter-btn"
				class:filter-active={filter === 'all'}
				aria-label="filter by all"
				on:click={() => (filter = 'all') && sortEvents()}>All opinions</button
			>
		</div>
	</nav>
	{#each filteredEvents as event}
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
				{@html marked(event.content)}
			</p>
		</div>
		<hr />
	{/each}
	<button class="primary-btn" on:click={() => (showNewOpinion = !showNewOpinion)}
		>Add your opinion</button
	>
	{#if showNewOpinion}
		<div class="add-opinion-init">
			<h3>Add your opinion</h3>
			<div class="description">
				<p>
					Thank you for contributing your security review of {name}. Please make sure to follow
					these guidelines:
				</p>
				<ul>
					<li>Stay objective in your review Focus on security-related aspects</li>
					<li>that's what we're about here Consider contributing a full review</li>
					<li>see our methodology</li>
				</ul>
			</div>
			{#if $activeProfile}
				<p>Logged in as {$activeProfile.pubkey}</p>
				<button class="primary-btn" on:click={logout}>Logout</button>
				<h3>Create new opinion</h3>
				<form on:submit|preventDefault={submit}>
					<label for="content">Content</label>
					<Editor bind:newOpinion />
					<label for="sentiment">Sentiment</label>
					<select name="sentiment" id="sentiment" bind:value={newOpinion.sentiment}>
						<option value="-1">negative</option>
						<option value="0">neutral</option>
						<option value="1">positive</option>
					</select>
					<button class="primary-btn" type="submit" disabled={!$activeProfile}>Submit</button>
					{#if !$activeProfile}
						<span>not logged in</span>
					{/if}
				</form>
			{:else}
				<button class="primary-btn" on:click={() => (showLoginOrRegister = 'login')}>Log in</button>
				<button class="primary-btn" on:click={() => (showLoginOrRegister = 'register')}
					>Register</button
				>
				{#if showLoginOrRegister === 'login'}
					<Login />
				{:else if showLoginOrRegister === 'register'}
					<Register />
				{/if}
			{/if}
		</div>
	{/if}
{/if}

<style>
	:host {
		--border-color: #dedede;
		--content-text-color: #606060;
		--pubkey-text-color: #000000;
		--date-text-color: #808080;
		--description-text-color: #808080;
		--filter-active-color: #000000;
		--filter-inactive-color: #808080;
		--button-text-color: #ffffff;
		--button-background-color: #000000;
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
	.blank-btn {
		background-color: transparent;
		border: none;
		cursor: pointer;
	}
	.filter-container {
		display: flex;
		flex-direction: row;
	}
	.filter-container > .filter-active {
		color: var(--filter-active-color);
	}
	.filter-btn {
		color: var(--filter-inactive-color);
	}
	.primary-btn {
		color: var(--button-text-color);
		background-color: var(--button-background-color);
		padding: 7px 20px;
		border-radius: 3px;
		cursor: pointer;
		border: none;
	}
</style>
