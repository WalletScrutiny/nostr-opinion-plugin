<svelte:options customElement="nostr-opinion-login" />

<script lang="ts">
	import { ndkUser } from '../stores/stores';
	import { NDKlogin, fetchUserProfile, privkeyLogin } from '../utils/helper';
	import ndk from '../stores/provider';
	import { type NDKFilter, type NDKUserProfile } from '@nostr-dev-kit/ndk';
	import {kindOpinion, profileImageUrl } from '../utils/constants';
	import { slide } from 'svelte/transition';
	import { nip19 } from 'nostr-tools';

	let showPrivateKeyInput = false;
	let nsec = '';

	export let profiles: { [key: string]: { content: NDKUserProfile } } = {};
	export let opinionContent: string;
	export let subject: string;
	export let showNewOpinion;

	const login = async (nostrKeyMethod: string | undefined) => {
		if (!nostrKeyMethod) return;
		let login;
		switch (nostrKeyMethod) {
			case 'pk':
				login = await privkeyLogin(nip19.decode(nsec).data as string);
				break;
			case 'nip07':
				login = await NDKlogin();
				break;
		}

		if (!login) {
			console.log('Something went wrong while login!!');
			return;
		}
		
		if (!$ndkUser) {
			console.log("Can't proceed. $ndkUser is null");
			return;
		}

		let content = await fetchUserProfile($ndkUser.pubkey);
		if (!content) {
			content = { image: profileImageUrl + $ndkUser.pubkey, pubkey: $ndkUser.pubkey };
		}
		if (!content.image) content.image = profileImageUrl + $ndkUser.pubkey;
		if (!content.pubkey) content.pubkey = $ndkUser.pubkey;
		showNewOpinion = false;
		const ndkFilter: NDKFilter = { kinds: [kindOpinion], '#d': [subject], authors: [$ndkUser.pubkey] };
		let fetchEvent = await $ndk.fetchEvent(ndkFilter, {
			closeOnEose: true
		});
		profiles[$ndkUser.pubkey] = { content };
		if (fetchEvent && fetchEvent.content) opinionContent = fetchEvent.content;
	};
</script>
<div transition:slide>
	{#if showPrivateKeyInput}
		<div transition:slide class="container">
			<h2 class="heading">
				Log in
			</h2>
			<p class="text">
				Enter your <strong>Nostr</strong> private key below to be able to post an opinion.<br />
				Don't have a key? <a href="/" class="text">Register</a>.
			</p>
			<input
				id="privkey"
				type="text"
				bind:value={nsec}
				placeholder="Your private key..."
				class="input"
			/>
			<button
				on:click={() => {
					login('pk');
				}}
				class="button"
				>Log in</button
			>
		</div>
	{:else}
		<div class="container">
			<h2 class="heading">
				Log in
			</h2>
			<p class="text">
				You have two options to log in. You can connect with an authentication tool like Alby that
				supports Nostr. Or you can enter your private key (<a
					href="/"
					class="text">view associated risks</a
				>).
			</p>
			{#if window}
				<button
					on:click={() => {
						login('nip07');
					}}
					class="button"
					>Connect using browser extension</button
				>
			{/if}
			<button
				on:click={() => (showPrivateKeyInput = !showPrivateKeyInput)}
				class="button"
				>Connect using private key</button
			>
		</div>
	{/if}
</div>


<style>
	.container {
		max-width: 600px;
		text-align: left;
		font-family: sans-serif;
	}

	.heading {
		font-size: 24px;
		margin-bottom: 8px;
	}

	.text {
		margin-bottom: 24px;
	}

	.input {
		padding: 10px;
		margin-bottom: 16px;
		border: 2px solid #ccc;
		border-radius: 4px;
		width: 100%;
		display: block;
	}

	.button {
		background-color: #4DA84D;
		color: white;
		border: none;
		font-size: 16px;
		cursor: pointer;
		padding: 10px;
		margin-bottom: 16px;
	}
</style>
