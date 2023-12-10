<script>
  import { generatePrivateKey, getPublicKey } from 'nostr-tools';
  import { onMount } from 'svelte';
  // import {signedEvent} from "../utils/signTx";
  import { activeProfile } from '../stores/stores';
	import { profileImageUrl } from '../utils/constants';

  let privkey = '';
  let pubkey = '';
  let showProfileSetup = false;
  let name = '';
  let about = '';
  let imageUrl = '';


  onMount(() => {
    privkey = generatePrivateKey();
  });

  const saveProfile = async() => {
    if (!privkey) return;
	pubkey = getPublicKey(privkey);
	
	let expertOpinions = (await import('../main')).expertOpinions;
	
	if(imageUrl == '' || !imageUrl) {
		imageUrl = profileImageUrl+pubkey ;
	}
	
    $activeProfile = {
      privkey,
	  flag: true,
      pubkey,
	  name,
	  about,
	  picture:imageUrl
    };
	const publishEventObject = {
		name,
		about,
		picture:imageUrl,
		pubkey
	}
	let publishEvent = {
		kind: 0,
		pubkey: getPublicKey(privkey),
		content: JSON.stringify(publishEventObject),
		tags:[],
		created_at: Math.floor(Date.now() / 1000)
	};
	// publishEvent = await signedEvent(publishEvent,privkey);
	// console.log(publishEvent);
	// const pub = expertOpinions.nostr.publish(publishEvent,(event)=>{
	// 	console.log(event);
	// });
	// const sub = expertOpinions.nostr.sub({
	// 	cb: (event)=>{
	// 		console.log(event);
	// 		// console.log(JSON.parse(event.content));
	// 	},
	// 	filter:{
	// 		kinds:[0],
	// 		authors:[getPublicKey("87c56ff793bf57545f4f12df3f971422015c4a2c35f39e3576c8b1a865196884")],
	// 		limit:2,
	// 	}
	// },null,()=>sub.unsub()
	// )

  };

  const copyToClipboard = () => {
    navigator.clipboard.writeText(privkey).then(() => {
      alert("Private Key copied");
    }, (error) => {
      console.error('Could not copy text: ', error);
    });
  };
</script>
<h3 style="font-family: 'Lato', sans-serif; font-size: 1.5em; color: #333; margin-top: 0;">Register</h3>
{#if showProfileSetup}
  <!-- Profile Setup Form -->
  <form on:submit|preventDefault={saveProfile}>
    <h2 style="font-family: 'Lato', sans-serif;">Set up your profile</h2>
    <p style="font-family: 'Lato', sans-serif;">
      This information will be shown with your comments. To upload images, use a service like Piccy.
    </p>
    <input type="text" placeholder="Enter your name..." bind:value={name}
           style="font-family: 'Lato', sans-serif; margin-bottom: 1em; width: 50%; height: 40px;display:block" required/>
    <textarea placeholder="Share a bit about yourself..." bind:value={about}
              style="font-family: 'Lato', sans-serif; margin-bottom: 1em; width: 50%; height: 100px;display:block" required></textarea>
    <input type="text" placeholder="Link to a profile image..." bind:value={imageUrl}
           style="font-family: 'Lato', sans-serif; margin-bottom: 1em; width: 50%; height: 40px;display:block"/>
    <button type="submit" 
            style="background-color: #4DA84D; color: white; border: none; padding: 10px 15px; 
                   font-family: 'Lato', sans-serif; border-radius: 4px; cursor: pointer;">
      Save profile
    </button>
  </form>
{:else}
<p style="font-family: 'Lato', sans-serif; font-size: 1em; color: #666;">
  We use <strong>Nostr</strong> to store opinions. You can post and access your posts via a unique private key.
  Copy your key and keep it in a safe place.
</p>
<div style="background-color: #f3f3f3; padding: 1em; border-radius: 4px; border: 1px solid #ccc;">
  <input id="privkey" type="text" bind:value={privkey} readonly 
         style="width: 100%; font-family: 'Lato', sans-serif; padding: 1em; 
                border: 1px solid #ccc; border-radius: 4px; box-sizing: border-box;"/>
  <button on:click={copyToClipboard} 
          style="background-color: #4DA84D; color: white; border: none; padding: 10px 15px; 
                 font-family: 'Lato', sans-serif; border-radius: 4px; cursor: pointer; margin-top: 0.5em;">
    Copy my key
  </button>
</div>
<button on:click={()=>showProfileSetup=true} 
        style="background-color: #6c757d; color: white; border: none; padding: 10px 15px; 
               font-family: 'Lato', sans-serif; border-radius: 4px; cursor: pointer; margin-top: 1em;">
  Continue
</button>
{/if}
