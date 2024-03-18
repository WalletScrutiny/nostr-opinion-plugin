<script lang="ts">
	import { fade, slide } from 'svelte/transition';
	import Editor from './Editor.svelte';
	import Positive from './icons/Positive.svelte';
	import Neutral from './icons/Neutral.svelte';
	import Negative from './icons/Negative.svelte';
	import LikeButton from './icons/LikeButton.svelte';
	import LikedButton from './icons/LikedButton.svelte';
	import DislikeButton from './icons/DislikeButton.svelte';
	import DislikedButton from './icons/DislikedButton.svelte';
	import ReplyButton from './icons/ReplyButton.svelte';
	import OptionButton from './icons/OptionButton.svelte';
	import ApprovedBadge from './icons/ApprovedBadge.svelte';
	import { marked } from 'marked';
	import { convertNostrPubKeyToBech32 } from '../utils/covertBech';
	import { localStore, ndkUser, theme } from '../stores/stores';
	import ndk from '../stores/provider';
	import {
		NDKEvent,
		NDKRelaySet,
		type NDKFilter,
		NDKKind,
		type NDKUserProfile,
		type Hexpubkey
	} from '@nostr-dev-kit/ndk';
	import { NDKlogin, calculateRelativeTime, fetchUserProfile, privkeyLogin } from '../utils/helper';
	import {
		DEFAULT_RELAY_URLS,
		kindNotes,
		kindOpinion,
		kindReaction,
		profileImageUrl,
		opinionHeaderRegex,
		opinionFooterRegex
	} from '../utils/constants';

	import FilePreview from './FilePreview.svelte';
	import Upload from './Upload.svelte';
	import DeleteEventData from '../utils/deleteEventData.svelte';
	import TextArea from './TextArea.svelte';
	import DOMPurify from 'dompurify';
	import Tooltip from './Tooltip.svelte';
	import ContentView from './ContentView.svelte';
	import { afterUpdate } from 'svelte';

	export let event: NDKEvent;
	export let profiles: { [key: string]: { content: NDKUserProfile } };
	export let submit: (published_at: string) => void = () => {};
	export let opinionContent: string;
	export let newOpinion: {
		content: string;
		sentiment: string;
	};
	export let sentimentCount: { [key: string]: number };
	export let editLvl: number; // TODO: create an enum for this type
	export let subject: string;
	export let count: number;
	export let deletedEventsArray: NDKEvent[] = [];
	export let isMine = false;
	export let trustedAuthors: Hexpubkey[] = [];
	opinionContent = opinionContent.replace(opinionHeaderRegex, '').replace(opinionFooterRegex, '');
	let replyEvents: NDKEvent[] = [];
	let reactions: (Partial<NDKEvent> & { timestamp: number })[] = [];
	let expertOpinions: typeof import('../main').expertOpinions;
	let likeCount = 0;
	let dislikeCount = 0;
	let edit = false;
	let reply = false;
	let replyContent = false;
	let loading = true;
	let liked = false;
	let disliked = false;
	let showFullText = false;
	let ATag = event.id;
	let relativeTime = '';
	let published_at: number | undefined = undefined;
	let created_at: number | undefined = undefined;
	let relay = JSON.parse(JSON.stringify(DEFAULT_RELAY_URLS));
	let isDeleted = false;
	let displayContent = event.content.replace(opinionHeaderRegex, '').replace(opinionFooterRegex, '');
	let processedContent = displayContent;
	 $: displayContent = editLvl > 1 
        ? event.content 
        : DOMPurify.sanitize(event.content.replace(opinionHeaderRegex, '').replace(opinionFooterRegex, ''));

	let fileArray: { files: File; url: string }[] = [];
	let contentElement: HTMLParagraphElement;
	let contentHeight = 300;
	let showReadMore = false;

	

	if (editLvl === 0) {
		ATag = kindOpinion + ':' + event.pubkey + ':' + subject;
	}

	function toggleFullText() {
		showFullText = !showFullText;
		showReadMore = !showReadMore;
	}

	// TODO: create enum for sentiment
	function selectSentiment(sentiment: '0' | '1' | '-1') {
		newOpinion = { ...newOpinion, sentiment };
	}

	async function reactPost(content: string) {
		const privkey = $localStore.pk;
		if (privkey) {
			!$ndk.signer && (await privkeyLogin(privkey));
		} else {
			!$ndk.signer && (await NDKlogin());
		}

		// TODO: In the code below, $ndkUser!.<key> needs the ! because ts couldn't infer
		// that $ndkUser won't be null after the previous check. Should fix that
		if (!$ndkUser) {
			return;
		}
		let idx = reactions.findIndex((e) => e.pubkey === $ndkUser!.pubkey);
		if (idx != -1 && reactions[idx].content === content) {
			content = '';
		}
		const ndkEvent = new NDKEvent($ndk);
		ndkEvent.kind = NDKKind.Reaction;
		ndkEvent.content = content;
		ndkEvent.tags = [
			['a', ATag],
			['p', $ndkUser.pubkey]
		];
		await ndkEvent.publish(NDKRelaySet.fromRelayUrls(relay.write, $ndk));
		idx = reactions.findIndex((e) => e.pubkey === $ndkUser!.pubkey);
		if (idx != -1) {
			reactions[idx] = { pubkey: $ndkUser.pubkey, content, timestamp: Date.now() };
		} else {
			reactions.push({ pubkey: $ndkUser.pubkey, content, timestamp: Date.now() });
		}
		likeCount = reactions.filter((e) => e.content === '+').length;
		dislikeCount = reactions.filter((e) => e.content === '-').length;
		if (content === '+') {
			liked = true;
			disliked = false;
		} else if (content === '-') {
			liked = false;
			disliked = true;
		} else {
			liked = false;
			disliked = false;
		}
	}
	const initialization = async () => {
		
		event.content = event.content.replace(opinionHeaderRegex, '').replace(opinionFooterRegex, '');
		const renderer = new marked.Renderer();

		const imageStyles = 'max-width: 100px; height: 100px; border-radius:10px; object-fit: cover;';

		renderer.image = (href, title, text) => {
			return `<img src="${href}" alt="${text}" title="${title}" style="${imageStyles}" />`;
		};

		renderer.link = (href, title, text) => {
			if (href.match(/\.(jpeg|jpg|gif|png|svg|webp)$/i) != null) {
				return `<a href="${href}" target="_blank"><img src="${href}" alt="${text}" title="${title}" style="${imageStyles}" /></a>`;
			}
			return `<a href="${href}" title="${title}" target="_blank">${text}</a>`;
		};

		marked.setOptions({ renderer });

		expertOpinions = (await import('../main')).expertOpinions;

		editLvl += 1;
		relativeTime = calculateRelativeTime(event.created_at as number); // TODO: created_at can be undefined, "as number" isn't a solution
		loading = false;
		let ndkFilter: NDKFilter = { kinds: [kindNotes], '#a': [ATag] };
		let fetchedEvents = await $ndk.fetchEvents(ndkFilter, { closeOnEose: false });
		fetchedEvents.forEach(async (event1) => {
			replyEvents = [...replyEvents, { ...event1 } as NDKEvent];
			const content = await fetchUserProfile(event1.pubkey);
			if (!content.image) content.image = profileImageUrl + event1.pubkey;
			if (!content.pubkey) content.pubkey = event1.pubkey;
			profiles[event1.pubkey] = { content };
		});

		let latestTime = 0;

		ndkFilter = { kinds: [kindReaction], '#a': [ATag] };
		let fetchedReactionEvents = await $ndk.fetchEvents(ndkFilter, { closeOnEose: false });
		fetchedReactionEvents.forEach((event2) => {
			let idx = reactions.findIndex((e) => e.pubkey === event2.pubkey);

			// TODO: check why NDK has events with these mandatory fields being optional in the types
			if (!event2.created_at) {
				return;
			}

			if (idx != -1) {
				if (reactions[idx].timestamp < event2.created_at) {
					reactions[idx] = {
						pubkey: event2.pubkey,
						content: event2.content,
						timestamp: event2.created_at
					};
				}
			} else {
				reactions.push({
					pubkey: event2.pubkey,
					content: event2.content,
					timestamp: event2.created_at
				});
			}
			likeCount = reactions.filter((e) => e.content === '+').length;
			dislikeCount = reactions.filter((e) => e.content === '-').length;
			if ($ndkUser?.pubkey && event2.pubkey === $ndkUser.pubkey && latestTime < event2.created_at) {
				latestTime = event2.created_at;
				if (event2.content === '+') {
					liked = true;
					disliked = false;
				} else if (event2.content === '-') {
					liked = false;
					disliked = true;
				} else {
					liked = false;
					disliked = false;
				}
			}
		});

		let fetchRelays = await $ndk.fetchEvent(
			{ kinds: [10002], authors: [event.pubkey] },
			{ closeOnEose: true }
		);
		if (fetchRelays) {
			fetchRelays.getMatchingTags('r').map((tags) => {
				if (tags.length === 3) {
					if (tags[2] === 'write' && !relay.write.includes(tags[1])) {
						relay.write.push(tags[1]);
					} else if (tags[2] === 'read' && !relay.read.includes(tags[1])) {
						relay.read.push(tags[1]);
					}
				} else if (tags.length === 2) {
					if (!relay.write.includes(tags[1])) {
						relay.write.push(tags[1]);
					}
					if (!relay.read.includes(tags[1])) {
						relay.read.push(tags[1]);
					}
				}
			});
		}
		const published_at_metadata = event.tags
			.filter((value) => value[0] === 'published_at')[0]?.[1]
			?.slice(0, 10);
		if (published_at_metadata) {
			published_at = parseInt(published_at_metadata);
		}
		created_at = event.created_at;
	};
	initialization();

	const submitReply = async () => {
		if (!$ndkUser) {
			console.error("Can't submit reply. $ndkUser is undefined");
			return;
		}

		const privkey = $localStore.pk;
		if (privkey) {
			!$ndk.signer && (await privkeyLogin(privkey));
		} else {
			!$ndk.signer && (await NDKlogin());
		}

		if (opinionContent === '' || !opinionContent) return;
		const ndkEvent = new NDKEvent($ndk);
		ndkEvent.kind = NDKKind.Text;
		ndkEvent.content = opinionContent;
		ndkEvent.tags = [
			['a', ATag],
			['p', $ndkUser.pubkey]
		];
		await ndkEvent.publish(NDKRelaySet.fromRelayUrls(relay.write, $ndk));
		replyEvents = [...replyEvents, { ...ndkEvent } as NDKEvent];
		opinionContent = '';
	};
	function deleteFile(fileToDelete: { files: File; url: string }) {
		const url = fileArray.filter((file) => file === fileToDelete)[0].url;
		opinionContent = opinionContent.replace(url, '');
		fileArray = fileArray.filter((file) => file !== fileToDelete);
	}

	$: if (isDeleted) {
		if (editLvl == 1) {
			isMine = false;
			let sentiment = newOpinion.sentiment;
			let value = sentimentCount[sentiment] - 1;
			if (sentiment === '1') {
				sentimentCount = { ...sentimentCount, '1': value };
			} else if (sentiment === '0') {
				sentimentCount = { ...sentimentCount, '0': value };
			} else {
				sentimentCount = { ...sentimentCount, '-1': value };
			}
			newOpinion = { content: '', sentiment: '0' };
			opinionContent = '';
		}
		deletedEventsArray = [...deletedEventsArray, event];
	}

	afterUpdate(() => {
        if (contentElement) {
            const actualHeight = contentElement.offsetHeight;
            showReadMore = actualHeight > contentHeight;
        }
    });
</script>
{#if !isDeleted}
	{#if !loading && expertOpinions}
		<div transition:slide class="opinion-container {isMine ? 'mine' : ''}">
			<div class="opinion-top">
				<div class="pubkey">
					<div>
						{#if event.tags.find((tag) => tag[0] === 'sentiment')?.[1] === '-1' && editLvl === 1}
							<Negative />
						{:else if event.tags.find((tag) => tag[0] === 'sentiment')?.[1] === '0' && editLvl === 1}
							<Neutral />
						{:else if editLvl === 1}
							<Positive />
						{/if}
					</div>
					{#if profiles[event.pubkey]}
						<div class="profile-header">
							<!-- svelte-ignore a11y-img-redundant-alt -->
							<img
								class="profile-image"
								src={profiles[event.pubkey].content?.image
									? profiles[event.pubkey].content?.image
									: profileImageUrl + event.pubkey}
								alt="Profile Picture"
							/>
							<span>
								{profiles[event.pubkey].content?.name ||
									convertNostrPubKeyToBech32(event.pubkey).slice(0, 10) +
										'...' +
										convertNostrPubKeyToBech32(event.pubkey).slice(-5)}
							</span>
						</div>
					{:else}
						<div class="profile-header">
							<img class="profile-image" src={profileImageUrl + event.pubkey} alt="Profile" />
							<span
								>{convertNostrPubKeyToBech32(event.pubkey).slice(0, 8) +
									'...' +
									convertNostrPubKeyToBech32(event.pubkey).slice(-4)}</span
							>
						</div>
					{/if}
					{#if trustedAuthors.includes(event.pubkey)}
						<ApprovedBadge />
					{/if}
				</div>

				<p class="date">
					{#if published_at && published_at < created_at}
						Edited.
					{/if}
					{relativeTime}
				</p>
			</div>
			{#if !edit}
				<p class="content" bind:this={contentElement} class:show-full={showFullText}>
				{#if editLvl == 1}
					<ContentView content={processedContent} />
				{:else}
					<!-- eslint-disable-next-line svelte/no-at-html-tags -->
					{@html processedContent}
				{/if}
				</p>
				<!-- svelte-ignore a11y-click-events-have-key-events -->
				{#if showReadMore}
					<!-- svelte-ignore a11y-click-events-have-key-events -->
					<!-- svelte-ignore a11y-no-static-element-interactions -->
					<span class="read-more" on:click={toggleFullText}>
						{showFullText ? 'Read Less' : 'Read More'}
					</span>
				{/if}
			{:else}
				<div transition:slide class="opinion-container {isMine ? 'mine' : ''}">
					<form on:submit|preventDefault={() => submit((published_at||new Date()).toString())}>
						<Editor bind:fileArray bind:opinionContent />
						<div
							id="sentiment-box"
							style="display:flex; flex-direction:column; gap:0.3rem; margin-bottom: 1rem;"
						>
							<label for="sentiment" style="font-weight: 600;">Choose your overall sentiment</label>
							<div style="display:flex; gap: 0.4rem;">
								<button
									on:click|preventDefault={() => selectSentiment('1')}
									class="deselected"
									class:dark = {$theme === 'dark'}
									class:selected={newOpinion.sentiment === '1'}
								>
									<Positive /> <span>Positive</span>
								</button>
								<button
									on:click|preventDefault={() => selectSentiment('0')}
									class="deselected"
									class:dark = {$theme === 'dark'}
									class:selected={newOpinion.sentiment === '0'}
								>
									<Neutral /> <span>Neutral</span>
								</button>
								<button
									on:click|preventDefault={() => selectSentiment('-1')}
									class="deselected"
									class:dark = {$theme === 'dark'}
									class:selected={newOpinion.sentiment === '-1'}
								>
									<Negative /> <span>Negative</span>
								</button>
							</div>
						</div>
						<div id="filePreview">
							{#each fileArray as file (file.url)}
								<FilePreview file={file.files} onDelete={() => deleteFile(file)} />
							{/each}
						</div>
						<div style="display:flex; align-contents:center;">
						<button type="submit" disabled={!$ndkUser} class="postButton"> Post </button>
						<Upload bind:fileArray bind:opinionContent />
						</div>
					</form>
				</div>
			{/if}
			<div class="reactionDiv">
				<div class="card-button">
					<button class="reactionButton" on:click={() => reactPost('+')}>
						{#if liked === true}
							<LikedButton />
						{:else}
							<LikeButton />
						{/if}
					</button>
					<span>{likeCount || 0}</span>
				</div>
				<div class="card-button">
					<button on:click={() => reactPost('-')} class="reactionButton">
						{#if disliked === true}
							<DislikedButton />
						{:else}
							<DislikeButton />
						{/if}
					</button>
					<span>{dislikeCount || 0}</span>
				</div>
				<div class="card-button">
					<Tooltip>
					<button id="replyButton" on:click={() => {reply = !reply; edit = false; opinionContent = ''; replyContent = false;}}>
						<ReplyButton />
					</button>
					<span slot="tooltip1Text">Add Reply</span>
					</Tooltip>

					<Tooltip>
					<button id="allReply" on:click={() => {replyContent = !replyContent;}}>
						<span style="pointer: cursor;">{replyEvents.length}</span>
					</button>
					<span slot="tooltip1Text">Replies</span>
					</Tooltip>
				</div>

				{#if $ndkUser?.pubkey === event.pubkey}
					<DeleteEventData eventID={event.id} bind:isDeleted bind:count />
				{/if}
				{#if $ndkUser?.pubkey === event.pubkey && editLvl == 1}
					<div class="card-button">
						<button
							on:click={() => {
								edit = !edit;
								opinionContent = event.content
									.replace(opinionHeaderRegex, '')
									.replace(opinionFooterRegex, '');

								newOpinion = {
									content: opinionContent,
									sentiment: event.tagValue('sentiment') || '0'
								};
								reply = false;
								replyContent = false;
							}}
							class="option-button"
						>
							<OptionButton />
						</button>
					</div>
				{/if}
			</div>
			{#if reply}
				<div class="reply-section" transition:fade>
					<TextArea bind:opinionContent />
					<div class="reply-file-preview">
						{#each fileArray as file (file.url)}
							<FilePreview file={file.files} onDelete={() => deleteFile(file)} />
						{/each}
					</div>
					<div class="reply-footer">
						<button
							class="reply-button"
							disabled={!$ndkUser}
							on:click={() => {
								submitReply();
								reply = false;
								replyContent = false;
							}}>Reply</button
						>
						<Upload bind:fileArray bind:opinionContent />
					</div>
				</div>
			{/if}
			{#if replyContent}
				{#each replyEvents as event (event.id)}
					<!-- Event loading!!! -->
					<svelte:self
						{event}
						{profiles}
						bind:sentimentCount
						bind:opinionContent
						bind:newOpinion
						{editLvl}
						{subject}
						bind:count={replyEvents.length}
					/>
				{/each}
			{/if}
		</div>
	{:else}
		<p class="loader">Loading...</p>
	{/if}
{/if}

<style>
	.opinion-container {
		border: 1px solid #e0e0e0;
		border-radius: 8px;
		padding: 16px;
		margin-bottom: 16px;
		background-color: var(--neutral-6, white);
        color: var(--neutral-0, black);
		font-family: 'Barlow', sans-serif;
	}

	.opinion-top {
		display: flex;
		justify-content: space-between;
		align-items: center;
		margin-bottom: 12px;
	}
	.pubkey {
		display: flex;
		align-items: center;
		gap: 10px;
		font-size: 16px;
		font-weight: 500;
	}
	.profile-header {
		display: flex;
		align-items: center;
		gap: 0.5rem;
		color: var(--neutral-0, black);
		font-size: 18px;
	}
	.profile-image {
		border-radius: 50%;
		width: 40px;
		height: 40px;
		object-fit: cover;
	}
	.date {
		color: var(--neutral-0, black);
		font-size: 14px;
	}
	.content {
		
		padding: 1rem;
		color: var(--neutral-0, black);
		margin-bottom: 16px;
		overflow-y: auto;
		max-height: 300px;
	}
	
    .content.show-full {
		max-height: max-content;
        overflow: visible;
    }
	.read-more {
		color: #4da84d;
		cursor: pointer;
		display: block;
	}
	.loader {
		display: flex;
		justify-content: center;
		align-items: center;
		margin: 2rem 0;
	}
	.reply-section {
		padding: 1rem;
	}
	.reply-file-preview {
		display: flex;
		gap: 1rem;
		flex-direction: row;
		flex-wrap: wrap;
		margin: 1rem 0;
	}
	.reply-footer {
		display: flex;
		align-content: center;
	}
	.reply-button {
		padding: 7px 20px;
		border-radius: 3px;
		cursor: pointer;
		border: none;
		height: 2.5rem;
		background-color: #4da84d;
		color: white;
	}
	.card-button {
		display: inline-flex;
		align-items: center;
		gap: 2px;
	}
	.option-button {
		background-color: transparent;
		border: none;
		cursor: pointer;
		display: flex;
		align-items: center;
		padding: 8px;
	}
	#allReply {
		background: none;
		border: none;
		cursor: pointer;
		display: flex;
		align-items: center;
		font-size: large;
		padding: 8px;
		color: var(--neutral-0, black);
	}
	#replyButton {
		background: none;
		background-color: transparent;
		border: none;
		cursor: pointer;
	}
	.reactionButton {
		background: none;
		background-color: transparent;
		border: none;
		cursor: pointer;
		display: flex;
		align-items: center;
		padding: 8px;
	}
	.reactionDiv {
		display: flex;
		gap: 2rem;
	}
	.dark {
		background-color: #434343;
		color: white;
	}
	.selected {
		border-radius: 3px;
		width: 7rem;
		height: 3rem;
		cursor: pointer;
		border: none;
		display: flex;
		justify-content: center;
		align-items: center;
		background-color: #4da84d;
		color: white;
	}
	.deselected {
		border-radius: 3px;
		width: 7rem;
		height: 3rem;
		cursor: pointer;
		border: none;
		display: flex;
		justify-content: center;
		align-items: center;
	}
	.postButton {
		color: #ffffff;
		background-color: #4da84d;
		padding: 7px 20px;
		border-radius: 3px;
		cursor: pointer;
		border: none;
		height: 2.5rem;
	}
	.opinion-container.mine {
		background-color: var(--neutral-6,#faefd9);
  	}
	#filePreview {
		display:flex; 
		gap:1rem; 
		flex-direction: row;
		flex-wrap: wrap;
		margin:1rem 0;
	}
</style>
