<svelte:options customElement="nostr-opinion-login" />
<script lang="ts">
	import {ndkUser } from '../stores/stores';
	import { NDKlogin, fetchUserProfile } from '../utils/helper';
	import ndk from '../stores/provider';
	import { type NDKFilter } from '@nostr-dev-kit/ndk';
	import { kindOpinion, profileImageUrl } from '../utils/constants';

	export let profiles;
	export let opinionContent:string;
	export let name:string;
	export let showNewOpinion:boolean;

	const login = async () => {
		const login = await NDKlogin();
		if(!login) {
			console.log("Something went wrong while login!!");
			return;
		}
		console.log($ndkUser.pubkey);
		let content = await fetchUserProfile($ndkUser.pubkey);
		if(!content){
			content = {image: profileImageUrl+$ndkUser.pubkey,pubkey:$ndkUser.pubkey};
		}
		if(!content.image)
			content.image = profileImageUrl+$ndkUser.pubkey
		if(!content.pubkey)
			content.pubkey = $ndkUser.pubkey;
				
		showNewOpinion=false;
		const ndkFilter:NDKFilter = {kinds:[kindOpinion],"#d":[name],authors:[$ndkUser.pubkey]};
		let fetchEvent = await $ndk.fetchEvent(ndkFilter,{
			closeOnEose:true,
		});
		
		profiles[$ndkUser.pubkey] = {content};
		if(fetchEvent && fetchEvent.content)
		opinionContent= fetchEvent.content;
	};
</script>


<div style="max-width: 600px;text-align: left; font-family: 'Lato', sans-serif;">
<h2 style="color: #333; font-size: 24px; margin-bottom: 8px; font-family: 'Lato', sans-serif;">Log in</h2>
<p style="color: #666; margin-bottom: 24px; font-family: 'Lato', sans-serif;">You have two options to log in. You can connect with an authentication tool like Alby that supports Nostr. Or you can enter your private key (<a href="/" style="font-family: 'Lato', sans-serif;">view associated risks</a>).</p>
{#if window}
    <button on:click={login} style="background-color: #4DA84D; color: white; border: none; font-size: 16px; cursor: pointer; padding: 10px; margin-bottom: 16px; font-family: 'Lato', sans-serif;">Connect</button>
	{:else}
	<p>Please subscribe to a client to put up opinion</p>
{/if}
</div>

