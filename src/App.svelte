<svelte:options customElement="nostr-opinion"/>
<script lang="ts">
	import { localStore, ndkUser, theme, themeModeLocalStorageObject } from './stores/stores';
	import Positive from './components/icons/Positive.svelte';
	import Neutral from './components/icons/Neutral.svelte';
	import Negative from './components/icons/Negative.svelte';
	import Register from './components/Register.svelte';
	import Login from './components/Login.svelte';
	import Editor from './components/Editor.svelte';
	import OpinionCard from './components/OpinionCard.svelte';
	import ConfirmationModal from './components/ConfirmationModal.svelte';
	import ndk from './stores/provider';
	import { NDKlogin, fetchUserProfile, logout, privkeyLogin } from './utils/helper';
	import {
		NDKEvent,
		NDKRelaySet,
		type NDKFilter,
		type NDKUserProfile,
		type Hexpubkey,
	} from '@nostr-dev-kit/ndk';
	import {
		DEFAULT_RELAY_URLS,
		opinionHeaderRegex,
		opinionFooterRegex,
		opinionFooterSeparator,
		opinionHeaderSeparator,
		kindDelete,
		kindOpinion,
		profileImageUrl
	} from './utils/constants';
	import Upload from './components/Upload.svelte';
	import FilePreview from './components/FilePreview.svelte';
	import { fade, slide } from 'svelte/transition';
	import type { ExtendedBaseType } from '@nostr-dev-kit/ndk-svelte';
	import DOMPurify from 'dompurify';
	import { initializeApprovedAuthors } from './utils/approvedAuthors';
	import type { ExpertOpinions } from './main';
	import { onDestroy } from 'svelte';

	export let subject: string;
	export let opinionTitle: string;
	export let opinionHeader: string = opinionTitle;
	export let opinionFooter: string | undefined = undefined;
	export let opinionImage: string | undefined = undefined;
	export let opinionTags: string = 'NostrOpinion';
	export let summary: string = `An opinion made about ${subject} generated using nostr-opinion-plugin.`;
	export let themeModeLocalStorageHandle: string = "colour-scheme";

	
	let relay_urls = JSON.parse(JSON.stringify(DEFAULT_RELAY_URLS));
	let expertOpinions: ExpertOpinions;
	let trustedAuthors: Hexpubkey[]=[];

	let allEvents: ExtendedBaseType<ExtendedBaseType<NDKEvent>>[] = [];
	let filteredEvents: ExtendedBaseType<ExtendedBaseType<NDKEvent>>[] = [];
	let profiles: { [key: string]: { content: NDKUserProfile } | undefined } = {};
	let editLvl = 0;
	let newOpinion = {
		content: '',
		sentiment: '0'
	};
	let opinionContent = '';
	let loading = true;
	let sentimentCount: { [key: string]: number } = {
		'-1': 0,
		'0': 0,
		'1': 0
	};
	let filter: 'approved' | 'all' = 'approved';
	let showNewOpinion = false;
	let showLoginOrRegister: 'login' | 'register' | false = false;
	let count = 0;
	let fileArray: { files: File; url: string }[] = [];
	let deletedEventsArray: ExtendedBaseType<ExtendedBaseType<NDKEvent>>[] = [];
	let isMine: boolean | undefined = false;
	let allEventLength = 0;
	let filteredEventLength = 0;
	let showModal: boolean = false;
	$: if(trustedAuthors) {
		sortEvents();
	}
	$: showNewOpinion, checkIfOpinionExists();
	$: {
		allEventLength = allEvents.filter((e) => !deletedEventsArray.includes(e)).length;

		filteredEventLength = filteredEvents.filter((e) => !deletedEventsArray.includes(e)).length;
	}
	let ndkFilter: NDKFilter = { kinds: [kindOpinion], '#d': [subject] };
	const sub = $ndk.storeSubscribe(ndkFilter, { closeOnEose: false });
	function isUserOpinion(eventPubKey: string): boolean {
		if(!$ndkUser)
			return false;
    	return $ndkUser && eventPubKey === $ndkUser.pubkey;
  	}
	$: {
		$sub.forEach(async (event) => {
			const value = allEvents.filter((e) => {
				return e.pubkey === event.pubkey;
			});
			if (value.length) {
				allEvents = allEvents.map((e) => {
					if (e.pubkey === event.pubkey) {
						return event;
					} else {
						return e;
					}
				});
			} else {
				allEvents = [...allEvents, { ...event } as NDKEvent];
				profiles[event.pubkey] = await findUserProfileData(event.pubkey);
			}
			sortEvents();
		});
	}

	const id = setInterval(()=>{
		theme.set(localStorage.getItem(themeModeLocalStorageHandle) || 'light');
	},1000);

	onDestroy(()=>{
		clearInterval(id);
	});

	const submit = async (published_at: string) => {
		const privkey = $localStore.pk;
		console.log("Published_at ");
		console.log(published_at);
		if (privkey) {
			!$ndk.signer && (await privkeyLogin(privkey));
		} else {
			!$ndk.signer && (await NDKlogin());
		}
		if (!opinionContent || !$ndk.signer) return;
		newOpinion.content = opinionHeader ? opinionHeader + opinionHeaderSeparator : ''
		newOpinion.content += opinionContent + opinionFooterSeparator;
		const alreadyPresent = (
			await $ndk.fetchEvent({ kinds: [kindOpinion], authors: [$ndkUser!.pubkey] })
		)?.tags;
		if (alreadyPresent?.length === 3 && alreadyPresent[2][1]) {
			published_at = alreadyPresent[2][1];
		}
		const ndkEvent = new NDKEvent($ndk);
		ndkEvent.kind = kindOpinion;
		if (!published_at || !published_at.length || published_at.length === 1) {
			published_at = (Date.now() + 5000).toString();
		}
		ndkEvent.tags = [
			['d', subject],
			['sentiment', newOpinion.sentiment],
			['summary', summary],
			['published_at', published_at],
		];
		if(opinionTitle) {
			ndkEvent.tags.push(['title', opinionTitle])
		}
    if (opinionImage) {
      ndkEvent.tags.push (['image', opinionImage])
    }
		opinionTags.split(',').map((tag) => {
			if (tag == '' || !tag) {
				return;
			}
			ndkEvent.tags.push(['t', tag]);
			newOpinion.content += `#${tag} `;
		});
		if (opinionFooter) {
			newOpinion.content += '\n\n' + opinionFooter;
		}
		ndkEvent.content = newOpinion.content;
		ndkEvent.publish(NDKRelaySet.fromRelayUrls(relay_urls.write, $ndk)).then(() => {
			const index = allEvents.findIndex((e) => e.pubkey === ndkEvent.pubkey);
			if (index !== -1) {
				allEvents[index] = { ...ndkEvent } as NDKEvent;
			} else {
				allEvents = [{ ...ndkEvent } as NDKEvent, ...allEvents];
			}
			sortEvents();
		});
		let value = deletedEventsArray.filter((e) => e.pubkey != $ndkUser?.pubkey);
		deletedEventsArray = [...value];
		isMine = true;
		showNewOpinion = false;
		filter = 'all';
	};

	const sortEvents = () => {
		sentimentCount = {
			'-1': 0,
			'0': 0,
			'1': 0
		};
		filteredEvents = allEvents.filter((e) => {
			if (filter === 'approved') {
				const trusted = trustedAuthors.includes(e.pubkey);
				if (!trusted) return false;
			}
			const sentiment = e.tags.find((t) => t[0] === 'sentiment')?.[1];
			if (sentiment && !deletedEventsArray.includes(e)) {
				sentimentCount[sentiment] += 1;
			}
			return true;
		});

		filteredEvents = filteredEvents.sort((a, b) => {
			const aTrusted = trustedAuthors.includes(a.pubkey);
			const bTrusted = trustedAuthors.includes(b.pubkey);
			if (aTrusted && !bTrusted) return -1;
			if (!aTrusted && bTrusted) return 1;
			let aCreatedAt = a?.created_at || 0;
			let bCreatedAt = b?.created_at || 0;
			if (aCreatedAt > bCreatedAt) return -1;
			if (aCreatedAt < bCreatedAt) return 1;
			return 0;
		});
	};

	async function findUserProfileData(pubkey: string) {
		if (!$ndkUser) {
			console.log("Can't find user profile. $ndkUser is undefined");
			return;
		}
		let content = await fetchUserProfile(pubkey);
		if (!content) {
			content = { image: profileImageUrl + $ndkUser.pubkey, pubkey: $ndkUser.pubkey };
		}
		if (!content.image) content.image = profileImageUrl + pubkey;
		if (!content.pubkey) {
			content.pubkey = pubkey;
		}
		return { content };
	}

	const initialization = async () => {
		expertOpinions = (await import('./main')).expertOpinions;
		themeModeLocalStorageObject.set(themeModeLocalStorageHandle);
		try {
			trustedAuthors = await initializeApprovedAuthors();
			const isloggedIn = $localStore.lastUserLogged;
			loading = false;
			if (isloggedIn && window) {
				let user = $ndk.getUser({
					npub: isloggedIn
				});
				checkIfOpinionExists();
				let fetchRelays = await $ndk.fetchEvent({ kinds: [10002], authors: [user.pubkey] });
				if (fetchRelays) {
					fetchRelays.getMatchingTags('r').map((tags) => {
						if (!relay_urls.read.includes(tags[1])) {
							if (tags.length === 3) {
								if (tags[2] === 'write' && !relay_urls.write.includes(tags[1])) {
									relay_urls.write.push(tags[1]);
								} else if (tags[2] === 'read' && !relay_urls.read.includes(tags[1])) {
									relay_urls.read.push(tags[1]);
								}
							} else if (tags.length === 2) {
								if (!relay_urls.write.includes(tags[1])) {
									relay_urls.write.push(tags[1]);
								}
								if (!relay_urls.read.includes(tags[1])) {
									relay_urls.read.push(tags[1]);
								}
							}
						}
					});
				}
				ndkUser.set(user);
				if ($ndkUser) {
					profiles[$ndkUser.pubkey] = await findUserProfileData($ndkUser.pubkey);
				}
				allEvents.map((e) => {
					if (e.pubkey === $ndkUser?.pubkey) {
						isMine = true;
					}
				});
			}
		} catch (error) {
			console.log(error);
		}
	};
	initialization();

	const Logout = () => {
		console.log(DEFAULT_RELAY_URLS);
		console.log(relay_urls);
		relay_urls = JSON.parse(JSON.stringify(DEFAULT_RELAY_URLS));
		console.log(relay_urls);
		isMine = false;
		logout();
		opinionContent = '';
	};

	function agreeToShowAll() {
		filter = 'all';
		sortEvents();
		showNewOpinion = false;
		showModal = false; // Close the modal
	}
	function onCancel() {
    	showModal = false;
	}

	function deleteFile(fileToDelete: { files: File; url: string }) {
		const url = fileArray.filter((file) => file === fileToDelete)[0].url;
		opinionContent = opinionContent.replace(url, '');
		opinionContent = opinionContent.replace("![]()","");
		opinionContent = opinionContent.replace("![image]()","");
		fileArray = fileArray.filter((file) => file !== fileToDelete);
	}

	const checkIfOpinionExists = async () => {
		if ($ndkUser) {
			let ndkFilter = { kinds: [kindOpinion], '#d': [subject], authors: [$ndkUser.pubkey] };
			const opinion = await $ndk.fetchEvent(ndkFilter);
			let deleteFilter = {
				kinds: [kindDelete],
				'#a': [`${kindOpinion}:${$ndkUser.pubkey}:${subject}`],
				authors: [$ndkUser.pubkey]
			};
			const del = await $ndk.fetchEvent(deleteFilter);
			if (del?.created_at < opinion?.created_at || (!del && opinion)) {
				isMine = true;
				let content =
					opinion?.content.replace(opinionHeaderRegex, '').replace(opinionFooterRegex, '') || '';
				const sentiment = opinion?.tagValue('sentiment') || '0';
				newOpinion = {
					content,
					sentiment
				};
				opinionContent = content;
			} else  if (showNewOpinion){
				isMine = false;
				newOpinion = {
					content: '',
					sentiment: '0'
				};
				opinionContent = '';
			}
		} 
	}
</script>

{#if loading}
	<p style="display:flex;justify-content:center;align-items:center;margin:2rem 0;">loading...</p>
{:else}
	<h1 class="expertOpinionsHeadline">
		{expertOpinions.headline
			.replace('$$nAll$$', allEventLength.toString() || '0')
			.replace('$$nTrusted$$', filter === 'approved' ? filteredEventLength.toString() : allEventLength.toString())}
	</h1>
	<p class="description">
		{expertOpinions.description}
	</p>
	{#if filteredEventLength < 1 && allEventLength >= 1 && filter === 'approved' }
		<div class="unfilterWarning">
			<button
				class:filter-active={filter === 'approved'}
				aria-label="filter by all"
				on:click={() => showModal = true}
			>
				Show {allEventLength} opinion{allEventLength === 1 ? ' of an unknown author' : 's of unknown authors'}.
			</button>⚠️ Viewer discretion advised.
		</div>
	{/if}
	<nav class="top-nav" transition:fade>
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
				on:click={() => {
					filter = 'approved';
					sortEvents();
					showNewOpinion = false;
				}}>Approved</button
			>
			<button
				class="blank-btn filter-btn"
				class:filter-active={filter === 'all'}
				aria-label="filter by all"
				on:click={() => showModal = true}>All opinions</button
			>
		</div>
	</nav>
	<div class="opinion-container" transition:slide>
		{#each filteredEvents as event (event.id)}
			{#if deletedEventsArray.includes(event) === false}
				<OpinionCard
					{event}
					isMine={isUserOpinion(event.pubkey)}
					{profiles}
					{submit}
					bind:sentimentCount
					bind:opinionContent
					bind:newOpinion
					{editLvl}
					{subject}
					bind:count
					bind:deletedEventsArray
					bind:trustedAuthors
				/>
			{/if}
		{/each}
	</div>
	<button class="primary-btn" on:click={()=>showNewOpinion = !showNewOpinion}
		>{!isMine ? 'Add' : 'Edit'} your opinion</button
	>
	{#if showNewOpinion}
		<div class="add-opinion-init" transition:fade>
			<h3>{!isMine ? 'Add' : 'Edit'} your opinion</h3>
			<div class="description">
				<!-- eslint-disable-next-line svelte/no-at-html-tags -->
				{@html DOMPurify.sanitize(expertOpinions.newOpinionDescription)}
			</div>
			{#if $ndkUser?.pubkey && profiles[$ndkUser?.pubkey]}
				<p>Logged in as {$ndkUser?.npub || '0'}</p>
				<button class="primary-btn" on:click={Logout}>Logout</button>
				<h3>Share your opinion</h3>
				<p class="description" style="margin-top:-1rem">
					We use Nostr to store opinions. You can post and access your posts via a unique private
					key.
				</p>
				<div
					class="placeholder"
				>
					<img
						id="imageContainer"
						src={profiles[$ndkUser?.pubkey]?.content?.image}
						alt="Miranda"
					/>
					<span style="font-size: 24px;">
						{!profiles[$ndkUser?.pubkey]?.content?.name ||
						profiles[$ndkUser?.pubkey]?.content?.name == ''
							? $ndkUser.npub.slice(0, 4) + '...' + $ndkUser.npub.slice(-4)
							: profiles[$ndkUser?.pubkey]?.content?.name}
					</span>
				</div>
				<form on:submit|preventDefault={()=>{submit(" ")}} id="review-input-details-container">
					<Editor bind:fileArray bind:opinionContent />
					<div id="sentiment-box">
						<label for="sentiment" style="font-weight: 600;"
							>Choose your overall sentiment</label
						>
						<div style="display:flex; gap: 0.4rem;">
							<button
								class="btn-standard"
								class:dark = {$theme=== 'dark'}
								class:selected-state={newOpinion.sentiment === '1'}
								on:click|preventDefault={() => {
									newOpinion = { ...newOpinion, sentiment: '1' };
								}}><Positive /> <span>Positive</span></button
							>
							<button
								class="btn-standard"
								class:dark = {$theme=== 'dark'}
								class:selected-state={newOpinion.sentiment === '0'}
								on:click|preventDefault={() => {
									newOpinion = { ...newOpinion, sentiment: '0' };
								}}><Neutral /> <span>Neutral</span></button
							>
							<button
								class="btn-standard"
								class:dark = {$theme=== 'dark'}
								class:selected-state={newOpinion.sentiment === '-1'}
								on:click|preventDefault={() => {
									newOpinion = { ...newOpinion, sentiment: '-1' };
								}}><Negative /> <span>Negative</span></button
							>
						</div>
					</div>
					<div id="filePreview">
						{#each fileArray as file (file.url)}
							<FilePreview file={file.files} onDelete={() => deleteFile(file)} />
						{/each}
					</div>
					<div style="display:flex; align-contents:center;">
						<button class="primary-btn" style="width: 5rem;" type="submit" disabled={!$ndkUser}
							>Post</button
						>
						<Upload bind:fileArray bind:opinionContent />
					</div>
				</form>
			{:else}
				<div transition:slide>
					<button class="primary-btn" on:click={() => (showLoginOrRegister = 'login')}
						>Log in</button
					>
					<button class="primary-btn" on:click={() => (showLoginOrRegister = 'register')}
						>Register</button
					>
					{#if showLoginOrRegister === 'login'}
						<Login bind:profiles bind:opinionContent bind:showNewOpinion  {subject}/>
					{:else if showLoginOrRegister === 'register'}
						<Register bind:profiles bind:showNewOpinion />
					{/if}
				</div>
			{/if}
		</div>
	{/if}
{/if}
{#if showModal}
    <ConfirmationModal onAgree={agreeToShowAll} onCancel={onCancel} />
{/if}

<style>
	:host {
		--border-color: #dedede;
		--content-text-color: #606060;
		--pubkey-text-color: #7c2323;
		--date-text-color: #808080;
		--description-text-color: #808080;
		--filter-active-color: #000000;
		--filter-inactive-color: #e2e1e1;
		--button-text-color: #ffffff;
		--button-background-color: #4da84d;
		--sentiment-button-background-color: #4da84d;
		font-family: Arial, sans-serif;
	}

	::-webkit-scrollbar {
		display: none;
	}
	
	* {
		-ms-overflow-style: none;
		scrollbar-width: none;
	}

	.expertOpinionsHeadline {
		font-family: 'Barlow';
	}

	.top-nav {
		display: flex;
		justify-content: space-between;
		border-top: #dedede 1px solid;
		border-bottom: #dedede 1px solid;
		padding: 20px 0;
	}
	.nav-count {
		display: flex;
		align-items: center;
	}
	.count-container {
		display: flex;
		flex-direction: row;

	}
	.description {
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
		color: #4da84d;
	}
	.filter-btn {
		color: #808080;
	}
	.primary-btn {
		color: #ffffff;
		background-color: #4da84d;
		padding: 7px 20px;
		border-radius: 3px;
		cursor: pointer;
		border: none;
		height: 2.5rem;
	}

	#review-input-details-container {
		display: flex;
		flex-direction: column;
		gap: 0.5rem;
		font-family: Arial, sans-serif;
	}
	.btn-standard {
		border-radius: 3px;
		width: 7rem;
		height: 3rem;
		cursor: pointer;
		border: none;
		padding-right: 1.5rem;
		display: flex;
		justify-content: center;
		align-items: center;
		color: #808080;
	}

	.dark {
		background-color: #434343;
		color: white;
	}

	.btn-standard:hover {
		background-color: #4da84d;
	}

	.btn-standard:hover {
		color: #ffffff;
	}

	#sentiment-box {
		display: flex;
		flex-direction: column;
		gap: 0.3rem;
	}
	.selected-state {
		background-color: #4da84d;
		color: #ffffff;
	}
	.placeholder{
		display:flex;
		font-family: Arial, sans-serif; 
		align-items:center; 
		gap:0.5rem; 
		margin-top:1rem; 
		margin-bottom: 1rem;
	}
	#imageContainer {
		display: block; 
		border-radius: 50%; 
		width: 50px; 
		height: 50px; 
		object-fit: cover;
	}
	#filePreview {
		display:flex; 
		gap:1rem; 
		flex-direction: row;
		flex-wrap: wrap;
		margin:1rem 0;
	}
	.unfilterWarning {
		padding: 7px;
		font-family: "Barlow", Arial, Helvetica, sans-serif;
		color: #808080;
		font-size:1em;
	}

	.unfilterWarning button {
		background-color: transparent;
		border: none;
		cursor: pointer;
		margin: none;
		color: #808080;
		font-family: "Barlow", Arial, Helvetica, sans-serif;
		font-size:1em;
		text-decoration: underline;
		text-decoration-thickness: 0.5px;
	}
</style>
