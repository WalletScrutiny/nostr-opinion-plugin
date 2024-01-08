<script >
  import { onMount } from 'svelte';
	import { profileImageUrl } from '../utils/constants';
	import { NDKPrivateKeySigner } from '@nostr-dev-kit/ndk';
  import ndk from "../stores/provider";
	import { ndkUser } from '../stores/stores';
	import { privkeyLogin } from '../utils/helper';
	import { slide } from 'svelte/transition';

  let privkey="";
  let pubkey = '';
  let showProfileSetup = false;
  let name = '';
  let about = '';
  let imageUrl = '';
  let pk;

  export let profiles;
  export let showNewOpinion;

  onMount(() => {
    pk = NDKPrivateKeySigner.generate();
    privkey = pk.privateKey;
  });

  const saveProfile = async() => {
    if (!privkey) return;

    if(imageUrl == '' || !imageUrl) {
      imageUrl = profileImageUrl+pubkey ;
    }
    const publishEventObject = {
      name,
      about,
      image:imageUrl,
    }
    $ndk.signer = pk;
    $ndkUser = await $ndk.signer.user();
    $ndkUser.ndk = $ndk;
    let content = publishEventObject;
    content = {...content,pubkey:$ndkUser.pubkey};
    $ndkUser.profile = publishEventObject;
    profiles[$ndkUser.pubkey] = {content};
    showNewOpinion = false;
    await $ndkUser.publish();
    await privkeyLogin(privkey);
};

  const copyToClipboard = () => {
    navigator.clipboard.writeText(privkey).then(() => {
      alert("Private Key copied");
    }, (error) => {
      console.error('Could not copy text: ', error);
    });
  };
</script>
<h3 style="font-family: 'Lato', sans-serif; font-size: 1.5em; color: #767676; margin-top: 0;">Register</h3>
{#if showProfileSetup}
  <!-- Profile Setup Form -->
  <form transition:slide on:submit|preventDefault={saveProfile} style="padding-right: 1.5rem;">
    <h2 style="font-family: 'Lato', sans-serif; color: #767676;">Set up your profile</h2>
    <p style="font-family: 'Lato', sans-serif; color: #767676;">
      This information will be shown with your comments. To upload images, use a service like Piccy.
    </p>
    <input type="text" placeholder="Enter your name..." bind:value={name}
           style="font-family: 'Lato', sans-serif; color: #333; background-color: #f8f8f8; 
                  margin-bottom: 1em; width: 100%; height: 50px; display: block; border: 1px solid #888; padding: 0.5em; font-size: 1.1em; border-radius:0.3rem;" required/>
    <textarea placeholder="Share a bit about yourself..." bind:value={about}
              style="font-family: 'Lato', sans-serif; color: #333; background-color: #f8f8f8; 
                     margin-bottom: 1em; width: 100%; height: 120px; display: block; border: 1px solid #888; padding: 0.5em; font-size: 1.1em;border-radius:0.3rem;" required></textarea>
    <input type="text" placeholder="Link to a profile image..." bind:value={imageUrl}
           style="font-family: 'Lato', sans-serif; color: #333; background-color: #f8f8f8; 
                  margin-bottom: 1em; width: 100%; height: 50px; display: block; border: 1px solid #888; padding: 0.5em; font-size: 1.1em;border-radius:0.3rem;"/>
    <button type="submit" 
            style="background-color: #4DA84D; color: white; border: 2px solid #3C8D3A; padding: 12px 18px; 
                   font-family: 'Lato', sans-serif; border-radius: 5px; cursor: pointer; font-size: 1.1em;">
      Save profile
    </button>
  </form>
{:else}
<div transition:slide >
<p style="font-family: 'Lato', sans-serif; font-size: 1em; color: #767676;">
  We use <strong style="color: #888888;">Nostr</strong> to store opinions. You can post and access your posts via your unique private key.
  Copy your key and keep it in a safe place.
</p>
<div style="background-color: #eaeaea; padding: 1em; border-radius: 4px; border: 1px solid #ccc;">
  <input id="privkey" type="text" bind:value={privkey} readonly 
         style="width: 100%; font-family: 'Lato', sans-serif; padding: 1em; 
                color: #333; background-color: #fff; border: 1px solid #888; 
                border-radius: 4px; box-sizing: border-box; font-size: 1.1em;"/>
  <button on:click={copyToClipboard} 
          style="background-color: #4DA84D; color: white; border: none; padding: 12px 18px; 
                 font-family: 'Lato', sans-serif; border-radius: 4px; cursor: pointer; margin-top: 0.5em; font-size: 1.1em;">
    Copy my key
  </button>
</div>
<button on:click={()=>showProfileSetup=!showProfileSetup} 
        style="background-color: #6c757d; color: white; border: 2px solid #565e66; padding: 12px 18px; 
               font-family: 'Lato', sans-serif; border-radius: 5px; cursor: pointer; margin-top: 1em; font-size: 1.1em;">
  Continue
</button>
</div>
{/if}
