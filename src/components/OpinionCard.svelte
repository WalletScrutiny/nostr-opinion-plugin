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
	import { expertOpinions as expertOpinionsExported } from '../main';
	import { localStore, ndkUser } from '../stores/stores';
	import ndk from '../stores/provider';
	import {
		NDKEvent,
		NDKRelaySet,
		type NDKFilter,
		NDKKind,
		type NDKUserProfile
	} from '@nostr-dev-kit/ndk';
	import { NDKlogin, calculateRelativeTime, fetchUserProfile, privkeyLogin } from '../utils/helper';
	import {
		DEFAULT_RELAY_URLS,
		kindNotes,
		kindOpinion,
		kindReaction,
		profileImageUrl
	} from '../utils/constants';

	import FilePreview from './FilePreview.svelte';
	import Upload from './Upload.svelte';
	import DeleteEventData from '../utils/deleteEventData.svelte';
	import TextArea from './TextArea.svelte';
	import DOMPurify from 'dompurify';

	export let event: NDKEvent;
	export let profiles: { [key: string]: { content: NDKUserProfile } };
	export let submit: (published_at: string) => void;
	export let opinionContent: string;
	export let selectPositive: boolean;
	export let selectNeutral: boolean;
	export let selectNegative: boolean;
	export let newOpinion: {
		content: string,
		sentiment: string
	};
	export let editLvl: number; // TODO: create an enum for this type
	export let subject: string;
	export let count: number;
	export let deletedEventsArray: NDKEvent[] = [];
	export let isMine = false;
    opinionContent = opinionContent.split("<!--HEADER END-->\n")?.[1]?.split("\n<!--FOOTER START-->")?.[0] || opinionContent;

	let replyEvents: NDKEvent[] = [];
	let reactions: (Partial<NDKEvent> & { timestamp: number })[] = [];
	let expertOpinions: typeof expertOpinionsExported;
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
	let relay = {
		read: DEFAULT_RELAY_URLS.read,
		write: DEFAULT_RELAY_URLS.write
	};
	let isDeleted = false;

	let fileArray: { files: File; url: string }[] = [];

	const maxLength = 500;

	if (editLvl === 0) {
		ATag = kindOpinion + ':' + event.pubkey + ':' + subject;
	}

	function toggleFullText() {
		showFullText = !showFullText;
	}

	function truncateText(text: string, length: number) {
		return text.length > length ? text.slice(0, length) + '...' : text;
	}

	// TODO: create enum for sentiment
	function selectSentiment(sentiment: '0' | '1' | '-1') {
		newOpinion.sentiment = sentiment;
		selectPositive = sentiment === '1';
		selectNeutral = sentiment === '0';
		selectNegative = sentiment === '-1';
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
		event.content =
			event.content.split('<!--HEADER END-->\n')?.[1]?.split('\n<!--FOOTER START-->')?.[0] ||
			event.content;
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
			console.log("Can't submit reply. $ndkUser is undefined");
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
		if(editLvl == 1 ) {
			isMine = false;
		}
		deletedEventsArray = [...deletedEventsArray, event];
	}
</script>

{#if !isDeleted}
	{#if !loading && expertOpinions}
		<div
			transition:slide
			class="opinion-container"
			style="border: 1px solid #e0e0e0; border-radius: 8px; padding: 16px; margin-bottom: 16px; background-color: #fff;"
		>
			<div
				class="opinion-top"
				style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 12px;"
			>
				<div
					class="pubkey"
					style="display: flex; align-items: center; gap: 10px; font-size: 16px; font-weight: 500;"
				>
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
						<div style="display: flex; align-items: center; gap: 0.5rem;">
							<!-- svelte-ignore a11y-img-redundant-alt -->
							<img
								src={profiles[event.pubkey].content?.image
									? profiles[event.pubkey].content?.image
									: profileImageUrl + event.pubkey}
								alt="Profile Picture"
								style="border-radius: 50%; width: 40px; height: 40px; object-fit: cover;"
							/>
							<span style="color:black;">
								{profiles[event.pubkey].content?.name ||
									convertNostrPubKeyToBech32(event.pubkey).slice(0, 8) +
										'...' +
										convertNostrPubKeyToBech32(event.pubkey).slice(-4)}
							</span>
						</div>
					{:else}
						<div style="display: flex; align-items: center; gap: 0.5rem;">
							<img
								src={profileImageUrl + event.pubkey}
								alt="Miranda"
								style="display: block; border-radius: 50%; width: 40px; height: 40px; object-fit: cover;"
							/>
							<span
								>{convertNostrPubKeyToBech32(event.pubkey).slice(0, 8) +
									'...' +
									convertNostrPubKeyToBech32(event.pubkey).slice(-4)}</span
							>
						</div>
					{/if}
					{#if expertOpinions.trustedAuthors.includes(event.pubkey)}
						<ApprovedBadge />
					{/if}
				</div>

				<p class="date" style="color: #757575; font-size: 14px;">
					{#if published_at && published_at < created_at}
						Edited.
					{/if}
					{relativeTime}
				</p>
			</div>
			{#if !edit}
				<p class="content" style="color: #333; margin-bottom: 16px; overflow:scroll">
					<!-- eslint-disable-next-line svelte/no-at-html-tags -->
					{@html showFullText
						? (editLvl > 1
							? (DOMPurify.sanitize(event.content))
							: (marked(
								DOMPurify.sanitize(
								  event.content
									.split('<!--HEADER END-->\n')?.[1]?.split('\n<!--FOOTER START-->')?.[0] || event.content
								)
							  ))
						)
						: (editLvl > 1
							? (truncateText(DOMPurify.sanitize(event.content), maxLength))
							: (marked(
								truncateText(
								  DOMPurify.sanitize(
									event.content
									  .split('<!--HEADER END-->\n')?.[1]?.split('\n<!--FOOTER START-->')?.[0] || event.content
								  ),
								  maxLength
								)
							  ))
						)
					  }
					  
					{#if event.content.length > maxLength}
						<!-- svelte-ignore a11y-click-events-have-key-events -->
						<!-- svelte-ignore a11y-no-static-element-interactions -->
						<span
							class="read-more"
							on:click={toggleFullText}
							style="color: var(--button-background-color); cursor: pointer;"
						>
							{showFullText ? ' Read Less' : ' Read More'}
						</span>
					{/if}
				</p>
			{:else}
				<div transition:slide style="margin: 2rem 0;">
					<form on:submit|preventDefault={() => submit(published_at.toString())}>
						<Editor bind:opinionContent />
						<div
							id="sentiment-box"
							style="display:flex; flex-direction:column; gap:0.3rem; margin-bottom: 1rem;"
						>
							<label for="sentiment" style="font-weight: 600;">Choose your overall sentiment</label>
							<div style="display:flex; gap: 0.4rem;">
								<button
									on:click|preventDefault={() => selectSentiment('1')}
									style="border-radius: 3px; width: 7rem; height: 3rem; cursor: pointer; border: none; display:flex; justify-content:center; align-items:center; {selectPositive
										? 'background-color: #4DA84D; color: white;'
										: ''}"
								>
									<Positive /> <span>Positive</span>
								</button>
								<button
									on:click|preventDefault={() => selectSentiment('0')}
									style="border-radius: 3px; width: 7rem; height: 3rem; cursor: pointer; border: none; display:flex; justify-content:center; align-items:center; {selectNeutral
										? 'background-color: #4DA84D; color: white;'
										: ''}"
								>
									<Neutral /> <span>Neutral</span>
								</button>
								<button
									on:click|preventDefault={() => selectSentiment('-1')}
									style="border-radius: 3px; width: 7rem; height: 3rem; cursor: pointer; border: none; display:flex; justify-content:center; align-items:center; {selectNegative
										? 'background-color: #4DA84D; color: white;'
										: ''}"
								>
									<Negative /> <span>Negative</span>
								</button>
							</div>
						</div>

						<button
							type="submit"
							disabled={!$ndkUser}
							style="color: var(--button-text-color); background-color: var(--button-background-color); padding: 7px 20px; border-radius: 3px; cursor: pointer; border: none; height: 2.5rem;"
						>
							Post
						</button>
					</form>
				</div>
			{/if}
			<div style="display: flex; gap: 2rem;">
				<div class="card-button" style="display: inline-flex; align-items: center; gap: 2px;">
					<button
						on:click={() => reactPost('+')}
						style="background-color: transparent; border: none; cursor: pointer; display: flex; align-items: center; padding: 8px;"
					>
						{#if liked === true}
							<LikedButton />
						{:else}
							<LikeButton />
						{/if}
					</button>
					<span style="font-size: 14px;color:black;">{likeCount || 0}</span>
				</div>
				<div class="card-button" style="display: inline-flex; align-items: center; gap: 2px;">
					<button
						on:click={() => reactPost('-')}
						style="background-color: transparent; border: none; cursor: pointer; display: flex; align-items: center; padding: 8px;"
					>
						{#if disliked === true}
							<DislikedButton />
						{:else}
							<DislikeButton />
						{/if}
					</button>
					<span style="font-size: 14px; color:black;">{dislikeCount || 0}</span>
				</div>
				<div class="card-button" style="display: inline-flex; align-items: center; gap: 2px;">
					<button
						on:click={() => {
							reply = !reply;
							edit = false;
							opinionContent = '';
							replyContent = false;
						}}
						style="background-color: transparent; border: none; cursor: pointer;"
					>
						<ReplyButton />
					</button>
					<button
						on:click={() => {
							replyContent = !replyContent;
						}}
						style="background-color: transparent; border: none; cursor: pointer; display: flex; align-items: center; padding: 8px;"
						><span style="font-size: 14px; pointer:cursor;">{replyEvents.length}</span></button
					>
				</div>

				{#if $ndkUser?.pubkey === event.pubkey}
					<DeleteEventData eventID={event.id} bind:isDeleted bind:count />
				{/if}
				{#if $ndkUser?.pubkey === event.pubkey && editLvl == 1}
					<div class="card-button" style="display: inline-flex; align-items: center; gap: 2px;">
						<button
							on:click={() => {
								edit = !edit;
								opinionContent = event.content;
								reply = false;
								replyContent = false;
							}}
							style="background-color: transparent; border: none; cursor: pointer; display: flex; align-items: center; padding: 8px;"
						>
							<OptionButton />
						</button>
					</div>
				{/if}
			</div>
			{#if reply}
				<div transition:fade style="padding:1rem;">
					<TextArea bind:opinionContent />
					<!-- <Editor bind:opinionContent /> -->
					<div style="display:flex; gap:1rem; overflow:scroll;margin:1rem 0;">
						{#each fileArray as file (file.url)}
							<FilePreview file={file.files} onDelete={() => deleteFile(file)} />
						{/each}
					</div>
					<div style="display:flex; align-contents:center;">
						<button
							style="padding: 7px 20px; border-radius: 3px;cursor: pointer;border: none;height: 2.5rem; background-color:#4DA84D;color:white"
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
						{submit}
						bind:opinionContent
						{selectPositive}
						{selectNeutral}
						{selectNegative}
						{newOpinion}
						{editLvl}
						{subject}
						bind:count={replyEvents.length}
					/>
				{/each}
			{/if}
		</div>
	{:else}
		<p style="display:flex;justify-content:center;align-items:center;margin:2rem 0;">Loading...</p>
	{/if}
{/if}
