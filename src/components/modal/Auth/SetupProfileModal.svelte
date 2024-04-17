<script lang="ts">
	import LoginModal from './LoginModal.svelte';
    import { NDKPrivateKeySigner } from '@nostr-dev-kit/ndk';
    import { onMount } from 'svelte';
    import { nip19 } from 'nostr-tools';
    import { hexToBytes } from '../../../utils/covertBech';
	import { showSetupProfileModal,profileUser, showMoreNewOpinions, toast} from '../../../stores/stores';
	import { profileImageUrl } from '../../../utils/constants';
	import ndk from '../../../stores/provider';
	import { ndkUser } from '../../../stores/stores';
	import Loader from '../../Loader.svelte';
	import { privkeyLogin } from '../../../utils/helper';

	export let name = '';
	export let about = '';
	export let imageUrl = '';

    let nsec: string = '';
    let hexPrivKey: string = '';
    let pk: NDKPrivateKeySigner;
	let pubkey = '';
	let loader = false;
   

    onMount(() => {
		pk = NDKPrivateKeySigner.generate();
		hexPrivKey = pk.privateKey as string;
		nsec = nip19.nsecEncode(hexToBytes(hexPrivKey));
	});

    const copyToClipboard = () => {
		navigator.clipboard.writeText(nsec).then(
			() => {
				alert("Your key was successfully copied");
			},
			(error) => {
				console.error('Could not copy text: ', error);
			}
		);
		login();
	};

	function triggerToast(type = 'success') {
		toast.set({ type: type, message: type === 'success' ? 'Registration successfully' : 'Registration Failed' });
	}

    const login = async () => {
		if (!nsec) return;
		if (imageUrl == '' || !imageUrl) {
			imageUrl = profileImageUrl + pubkey;
		}
		loader = true;
		const publishEventObject = {
			name,
			about,
			image: imageUrl,
			pubkey: ''
		};
		$ndk.signer = pk;
		$ndkUser = await $ndk.signer.user();
		$ndkUser.ndk = $ndk;
		let value = publishEventObject;
		value = { ...value, pubkey: $ndkUser.pubkey };
		$ndkUser.profile = publishEventObject;
		let profileValue = {content: value};
		try {
			await $ndkUser.publish();
			await privkeyLogin(hexPrivKey);
			profileUser.update((u) => [...u, profileValue]);
			triggerToast("success");
		} catch (error) {
			console.log(error);
			$ndkUser.profile = {};
			triggerToast("failed");
		} finally {
			loader = false;
			showSetupProfileModal.set(false);
			showMoreNewOpinions.set(false);
		}
    }
</script>

{#if !loader}
<LoginModal>
	<span slot="heading">Register</span>
	<span slot="description"
		>We use Nostr to store opinions. You can post and access your posts via your unique private key.
		Copy your key and keep it in a safe place.</span
	>
    
	<span slot="button" class="key">
       <span >{nsec}</span>
	</span>
    <span slot="showMore" class="show-more">
        <button class="copy-key-button" on:click={copyToClipboard}>
            Copy my key
        </button>
        <button class="show-more-button" on:click={login}>skip</button>
    </span>
</LoginModal>
{/if}
{#if loader}
<LoginModal>
    <span slot="loader">
        <Loader/>
    </span>
</LoginModal>
{/if}

<style>
    .copy-key-button {
        border: 3px solid black;
        border-radius: 25px;
        width: 50%;
        padding: 10px;
        font-size: large;
        background-color: white;
        margin: 10px;
        cursor: pointer;
    }
    .show-more{
        display: flex;
        flex-direction: row;
    }
    .key{
        margin: 20px 0;
        padding: 20px;
    }

    .show-more-button {
        border: 3px solid black;
        border-radius: 25px;
        width: 50%;
        padding: 10px;
        font-size: large;
        background-color: white;
        margin: 10px;
        cursor: pointer;
    }
</style>