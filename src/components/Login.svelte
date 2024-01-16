<svelte:options customElement="nostr-opinion-login" />
<script lang="ts">
	import {ndkUser } from '../stores/stores';
	import { NDKlogin, fetchUserProfile, privkeyLogin } from '../utils/helper';
	import ndk from '../stores/provider';
	import { type NDKFilter } from '@nostr-dev-kit/ndk';
	import { kindOpinion, profileImageUrl } from '../utils/constants';
	import { slide } from 'svelte/transition';

	let showPrivateKeyInput = false;
	let privkey = '';

	export let profiles;
	export let opinionContent:string;
	export let name:string;
	export let showNewOpinion;

	const login = async (nostrKeyMethod:string|undefined) => {
		if(!nostrKeyMethod)
		return;
		let login;
		switch (nostrKeyMethod) {
			case 'pk': 
				login  = await privkeyLogin(privkey);
				break;
			case 'nip07':
				login = await NDKlogin();
				break;
		}

		if(!login) {
			console.log("Something went wrong while login!!");
			return;
		}
		let content = await fetchUserProfile($ndkUser.pubkey);
		if(!content){
			content = {image: profileImageUrl+$ndkUser.pubkey,pubkey:$ndkUser.pubkey};
		}
		if(!content.image)
			content.image = profileImageUrl+$ndkUser.pubkey
		if(!content.pubkey)
			content.pubkey = $ndkUser.pubkey;
		showNewOpinion = false;
		const ndkFilter:NDKFilter = {kinds:[kindOpinion],"#d":[name],authors:[$ndkUser.pubkey]};
		let fetchEvent = await $ndk.fetchEvent(ndkFilter,{
			closeOnEose:true,
		});
		profiles[$ndkUser.pubkey] = {content};
		if(fetchEvent && fetchEvent.content)
		opinionContent= fetchEvent.content;
		
	};
</script>


<div transition:slide>
{#if showPrivateKeyInput}
  <div transition:slide style="max-width: 600px;text-align: left; font-family: 'Lato', sans-serif;">
    <h2 style="color: #333; font-size: 24px; margin-bottom: 8px; font-family: 'Lato', sans-serif;">Log in</h2>
    <p style="color: #666; margin-bottom: 24px; font-family: 'Lato', sans-serif;">Enter your <strong>Nostr</strong> private key below to be able to post an opinion.<br>
    Don't have a key? <a href="/" style="font-family: 'Lato', sans-serif;">Register</a>.</p>
    <input id="privkey" type="text" bind:value={privkey} placeholder="Your private key..." style="padding: 10px; margin-bottom: 16px; border: 2px solid #ccc; border-radius: 4px; width: 100%; display: block; font-family: 'Lato', sans-serif;" />
    <button on:click={()=>{login("pk")}} style="background-color: #4DA84D; color: white; border: none; font-size: 16px; cursor: pointer; padding: 10px; margin-bottom: 16px; font-family: 'Lato', sans-serif;">Log in</button>
  </div>
{:else}
	<div style="max-width: 600px;text-align: left; font-family: 'Lato', sans-serif;">
		<h2 style="color: #333; font-size: 24px; margin-bottom: 8px; font-family: 'Lato', sans-serif;">Log in</h2>
		<p style="color: #666; margin-bottom: 24px; font-family: 'Lato', sans-serif;">You have two options to log in. You can connect with an authentication tool like Alby that supports Nostr. Or you can enter your private key (<a href="/" style="font-family: 'Lato', sans-serif;">view associated risks</a>).</p>
		{#if window}
			<button on:click={()=>{login("nip07")}} style="background-color: #4DA84D; color: white; border: none; font-size: 16px; cursor: pointer; padding: 10px; margin-bottom: 16px; font-family: 'Lato', sans-serif;">Connect using browser extension</button>
		{/if}
		<button on:click={()=>showPrivateKeyInput=!showPrivateKeyInput} style="background-color: #4DA84D; color: white; border: none; font-size: 16px; cursor: pointer; padding: 10px; margin-bottom: 16px; font-family: 'Lato', sans-serif;">Connect using private key</button>
	</div>
{/if}
</div>