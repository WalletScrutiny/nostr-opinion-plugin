<script lang="ts">
	import { onMount } from 'svelte';
	import { profileImageUrl } from '../utils/constants';
	import { NDKPrivateKeySigner, type NDKUserProfile } from '@nostr-dev-kit/ndk';
	import ndk from '../stores/provider';
	import { ndkUser } from '../stores/stores';
	import { privkeyLogin } from '../utils/helper';
	import { slide } from 'svelte/transition';
	import { nip19 } from 'nostr-tools';

	let nsec = '';
	let hexPrivKey = '';
	let pubkey = '';
	let showProfileSetup = false;
	let name = '';
	let about = '';
	let imageUrl = '';
	let pk: NDKPrivateKeySigner;

	export let profiles: { [key: string]: { content: NDKUserProfile } } = {};
	export let showNewOpinion;

	onMount(() => {
		pk = NDKPrivateKeySigner.generate();
		hexPrivKey = pk.privateKey as string; // todo: fix this error if "as string" is not done: Type 'string | undefined' is not assignable to type 'string'.
		nsec = nip19.nsecEncode(hexPrivKey) as string;
	});

	const saveProfile = async () => {
		if (!nsec) return;

		if (imageUrl == '' || !imageUrl) {
			imageUrl = profileImageUrl + pubkey;
		}
		const publishEventObject = {
			name,
			about,
			image: imageUrl,
			pubkey: ''
		};
		$ndk.signer = pk;
		$ndkUser = await $ndk.signer.user();
		$ndkUser.ndk = $ndk;
		let content = publishEventObject;
		content = { ...content, pubkey: $ndkUser.pubkey };
		$ndkUser.profile = publishEventObject;
		profiles[$ndkUser.pubkey] = { content };
		showNewOpinion = false;
		await $ndkUser.publish();
		await privkeyLogin(hexPrivKey);
	};

	const copyToClipboard = () => {
		navigator.clipboard.writeText(nsec).then(
			() => {
				alert('Private Key copied');
			},
			(error) => {
				console.error('Could not copy text: ', error);
			}
		);
	};
</script>

<h3>Register</h3>
{#if showProfileSetup}
    <!-- Profile Setup Form -->
    <form transition:slide on:submit|preventDefault={saveProfile}>
        <h2>Set up your profile</h2>
        <p>This information will be shown with your comments. To upload images, use a service like Piccy.</p>
        <input
            type="text"
            placeholder="Enter your name..."
            bind:value={name}
            required
        />
        <textarea
            placeholder="Share a bit about yourself..."
            bind:value={about}
            required
        ></textarea>
        <input
            type="text"
            placeholder="Link to a profile image..."
            bind:value={imageUrl}
        />
        <button type="submit">
            Save profile
        </button>
    </form>
{:else}
    <div transition:slide>
        <p>We use <strong>Nostr</strong> to store opinions. You can post and access your posts via your unique private key. Copy your key and keep it in a safe place.</p>
        <div class="key-container">
            <input
                id="privkey"
                type="text"
                bind:value={hexPrivKey}
                readonly
            />
            <button class="copy-key-button" on:click={copyToClipboard}>
                Copy my key
            </button>
        </div>
        <button class="continue-button" on:click={() => (showProfileSetup = !showProfileSetup)}>
            Continue
        </button>
    </div>
{/if}


<style>
    h3, h2, p, input, textarea, button {
        font-family: sans-serif;
    }

    h3 {
        font-size: 1.5em;
        color: #767676;
        margin-top: 0;
    }

    form {
        padding-right: 1.5rem;
    }

    h2, p {
        color: #767676;
    }

    input, textarea {
        color: #333;
        background-color: #f8f8f8;
        margin-bottom: 1em;
        width: 100%;
        display: block;
        border: 1px solid #888;
        padding: 0.5em;
        font-size: 1.1em;
        border-radius: 0.3rem;
    }

    input[type="text"] {
        height: 50px;
    }

    textarea {
        height: 120px;
    }

    button {
        background-color: #4DA84D;
        color: white;
        border: none;
        padding: 12px 18px;
        cursor: pointer;
        font-size: 1.1em;
        border-radius: 5px;
    }

    .copy-key-button, .continue-button {
        margin-top: 0.5em;
    }

    .continue-button {
        background-color: #6c757d;
        border: 2px solid #565e66;
    }

    .key-container {
        background-color: #eaeaea;
        padding: 1em;
        border-radius: 4px;
        border: 1px solid #ccc;
    }

    .key-container input {
        background-color: #fff;
        border: 1px solid #888;
        border-radius: 4px;
        padding: 1em;
        width: 100%;
        box-sizing: border-box;
        font-size: 1.1em;
    }
</style>
