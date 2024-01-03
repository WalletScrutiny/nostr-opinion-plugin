<svelte:options customElement="nostr-opinion" />

<script lang="ts">
	import {  localStore, ndkUser } from './stores/stores';
	import Positive from './components/icons/Positive.svelte';
	import Neutral from './components/icons/Neutral.svelte';
	import Negative from './components/icons/Negative.svelte';
	import Register from './components/Register.svelte';
	import Login from './components/Login.svelte';
	import Editor from './components/Editor.svelte';
	import OpinionCard from "./components/OpinionCard.svelte";
	import ndk from './stores/provider';
	import {NDKlogin, fetchUserProfile, logout, privkeyLogin} from './utils/helper'
	import { NDKEvent, type NDKFilter} from '@nostr-dev-kit/ndk';
	import { kindOpinion, profileImageUrl } from './utils/constants';
	import Upload from './components/Upload.svelte';
	import FilePreview from './components/FilePreview.svelte';
	import { fade, slide } from 'svelte/transition';

	export let name: string;
	
	let expertOpinions: typeof import('./main').expertOpinions;
	let allEvents: any[] = [];
	let filteredEvents: any[] = [];
	let profiles: Record<string, {NDKUserProfile}|{pubkey:string,image:string}> = {};
	let selectPositive:Boolean = false;
	let selectNeutral:Boolean = true;
	let selectNegative:Boolean = false;
	let editLvl = 0;
	let newOpinion = {
		content: '',
		sentiment: '0'
	};
	let opinionContent="";
	let loading = true;
	let sentimentCount = {
		'-1': 0,
		'0': 0,
		'1': 0
	};
	let filter: 'approved' | 'all' = 'approved';
	let showNewOpinion = false;
	let showLoginOrRegister: 'login' | 'register' | false = false;
	let count = 0;
	let fileArray=[];

	let ndkFilter:NDKFilter = {kinds:[kindOpinion],"#d":[name]};
	// const sub = $ndk.subscribe(ndkFilter,{closeOnEose:false});
	const sub = $ndk.storeSubscribe(ndkFilter,{closeOnEose:false});
	$: {
		$sub.forEach(async(event)=>{
			const value = allEvents.filter((e)=>{
			return e.pubkey === event.pubkey;
			});
			if(value.length) {
				allEvents = allEvents.map((e)=>{
					if(e.pubkey === event.pubkey) {
						return event;
					} else {
						return e;
					}
				});
			} else {
				allEvents = [...allEvents, {...event}];
				profiles[event.pubkey] = await findUserProfileData(event.pubkey);
			}
			sortEvents();
		})
	};
	const submit = async () => {
		newOpinion.content = opinionContent;
		const privkey = $localStore.pk;
		if(privkey){
            !$ndk.signer && await privkeyLogin(privkey);
        } else {
            !$ndk.signer && await NDKlogin();
        }
		if (!newOpinion.content || !$ndk.signer) return;
		const ndkEvent = new NDKEvent($ndk);
		ndkEvent.kind = kindOpinion;
		ndkEvent.content = newOpinion.content;
		ndkEvent.tags = [
			["d",name],
			["sentiment",newOpinion.sentiment]
		];
		ndkEvent.publish().then(()=>{
			const index = allEvents.findIndex((e) => e.pubkey === ndkEvent.pubkey);
			if (index !== -1) {
				allEvents[index] = {...ndkEvent};
			} else {
				allEvents = [{...ndkEvent}, ...allEvents];
			}
			sortEvents();
		});
		newOpinion={
			content: '',
			sentiment: '0'
		};
		selectPositive = false;
		selectNeutral = true;
		selectNegative = false;
		showNewOpinion=false;
		filter = "all";
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

	async function findUserProfileData(pubkey:string){
		let content = await fetchUserProfile(pubkey);
		if(!content){
			content = {image: profileImageUrl+$ndkUser.pubkey,pubkey:$ndkUser.pubkey};
		}
		if(!content.image)
			content.image = profileImageUrl+pubkey ;
		if(!content.pubkey){
			content.pubkey = pubkey;
		}
		return {content};
	}

	const initialization = async()=> {
		expertOpinions = (await import('./main')).expertOpinions;
		try {
			await $ndk.connect();
			console.log("NDK connected successfully");
			const isloggedIn = $localStore.lastUserLogged;
			if(isloggedIn && window) {
				let user = $ndk.getUser({
					npub:$localStore.lastUserLogged,
				});
				ndkUser.set(user);
				profiles[$ndkUser.pubkey] = await findUserProfileData($ndkUser.pubkey);
			}
			loading = false;
		} catch (error) {
			console.log(error);
		}
	}
	initialization();

	const Logout = () => {
		logout();
		opinionContent="";
	};

	function deleteFile(fileToDelete) {
        const url = fileArray.filter(file => file === fileToDelete)[0].url;
        opinionContent = opinionContent.replace(url,"");
        fileArray = fileArray.filter(file => file !== fileToDelete);
    }

</script>

<h1>Community opinions ({allEvents?.length || '0'})</h1>
<p class="description">
	These comments are contributed by members of the Wallet Scrutiny community like you. Thank you for
	helping review wallets for security issues and enabling more people to secure and custody their
	bitcoin.
</p>
{#if loading}
	<p style="display:flex;justify-content:center;align-items:center;margin:2rem 0;">loading...</p>
{:else}
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
	<div class="opinion-container" transition:slide>
		{#each filteredEvents as event (event.id)}
			<OpinionCard {event} {profiles} {submit} bind:opinionContent {selectPositive} {selectNeutral} {selectNegative} {newOpinion} {editLvl} {name} bind:count/>
		{/each}
	</div>
	<button class="primary-btn" on:click={() => (showNewOpinion = !showNewOpinion)}
		>Add your opinion</button
	>
	{#if showNewOpinion}
		<div class="add-opinion-init" transition:fade>
			<h3 style="color:black;">Add your opinion</h3>
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
			{#if $ndkUser?.pubkey && profiles[$ndkUser?.pubkey]}
				<p style="color:black;">Logged in as {$ndkUser?.npub || "0"}</p>
				<button class="primary-btn" on:click={Logout}>Logout</button>
				<h3 style="color:black;">Share your opinion</h3>
				<p class="description" style="margin:0rem 0rem; margin-top:-1rem">We use Nostr to store opinions. You can post and access your posts via a unique private key.</p>
				<form on:submit|preventDefault={submit} id="review-input-details-container">
					<div style="display:flex;font-family: Arial, sans-serif; align-items:center; gap:0.5rem; margin-top:1rem; margin-bottom: 1rem;">
						<img src={profiles[$ndkUser?.pubkey]?.content?.image} alt="Miranda" style="display: block; border-radius: 50%; width: 50px; height: 50px; object-fit: cover;"/>
						<span style="color: black; font-size: 24px;">
							{(!profiles[$ndkUser?.pubkey]?.content?.name || profiles[$ndkUser?.pubkey]?.content?.name=='') ? $ndkUser.npub.slice(0,4)+"..."+$ndkUser.npub.slice(-4) : profiles[$ndkUser?.pubkey]?.content?.name}
						</span>
					</div>
					<Editor bind:opinionContent />
					<div id="sentiment-box">	
						<label for="sentiment" style="font-weight: 600;font-family: Arial, sans-serif;">Choose your overall sentiment</label>
						<div style="display:flex; gap: 0.4rem;">	
							<button class="btn-standard" class:selected-state={selectPositive} on:click|preventDefault={()=>{newOpinion.sentiment="1";selectPositive=true;selectNegative=false;selectNeutral=false;}}><Positive/> <span>Positive</span></button>
							<button class="btn-standard" class:selected-state={selectNeutral} on:click|preventDefault={()=>{newOpinion.sentiment="0";selectPositive=false;selectNegative=false;selectNeutral=true}}><Neutral/> <span>Neutral</span></button>
							<button class="btn-standard" class:selected-state={selectNegative} on:click|preventDefault={()=>{newOpinion.sentiment="-1";selectPositive=false;selectNegative=true;selectNeutral=false}}><Negative/> <span>Negative</span></button>
						</div>
					</div>
					<div style="display:flex; gap:1rem; overflow:scroll;margin:1rem 0;">
					{#each fileArray as file, index (file.url)}
					<FilePreview key={index} file={file.files} onDelete={() => deleteFile(file)} />
					{/each}
					</div>
					<div style="display:flex; align-contents:center;">
					<button class="primary-btn" style="width: 5rem;" type="submit" disabled={!$ndkUser}>Post</button>
					<Upload bind:fileArray bind:opinionContent/>
					</div>
				</form> 
			{:else}
				<div transition:slide>
				<button class="primary-btn" on:click={() => (showLoginOrRegister = 'login')}>Log in</button>
				<button class="primary-btn" on:click={() => (showLoginOrRegister = 'register')}
					>Register</button
				>
				{#if showLoginOrRegister === 'login'}
					<Login bind:profiles bind:opinionContent bind:showNewOpinion {name} />
				{:else if showLoginOrRegister === 'register'}
					<Register bind:profiles bind:showNewOpinion/>
				{/if}
				</div>
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
		--button-background-color: #4DA84D;
		--sentiment-button-background-color:#4DA84D;
		font-family: Lato;
		font-family: Arial, sans-serif;
		background-color: black;
	}
	h1 {
		margin: 5px 0;
		color: black;
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
		color: black;
	}
	.opinion-top {
		display: flex;
		justify-content: space-between;
	}
	.description {
		color: #808080;
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
		height: 2.5rem;
	}

	#review-input-details-container {
		display:flex; 
		flex-direction:column; 
		gap:0.5rem;
		font-family: 'lato';
		margin: 2rem 0rem;
	}
	.btn-standard {
		border-radius: 3px;
		width: 7rem;
		height: 3rem;
		cursor: pointer;
		border: none;	
		padding-right: 1.5rem;
		display:flex;
		justify-content:center;
		align-items:center;
		color: #808080;
	}

	.btn-standard:hover {
		background-color: var(--sentiment-button-background-color);
	}

	.btn-standard:hover {
		color: #ffffff;
	}
	
	#sentiment-box {
		display:flex;
		flex-direction:column;
		gap:0.3rem;
	}
	.selected-state {
		background-color:var(--sentiment-button-background-color);
		color: #ffffff;
		
	}
</style>
					