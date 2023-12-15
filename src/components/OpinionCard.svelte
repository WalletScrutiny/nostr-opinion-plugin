<script lang="ts">
    import { onMount } from 'svelte';
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
    import { convertNostrPubKeyToBech32 } from "../utils/covertBech";
    import OpinionCard from "./OpinionCard.svelte";
	import { ndkUser } from '../stores/stores';
    import ndk from "../stores/provider";
	import { NDKEvent,type NDKFilter } from '@nostr-dev-kit/ndk';
	import { NDKlogin, fetchUserProfile } from '../utils/helper';
	import { kindNotes, kindOpinion, kindReaction, profileImageUrl } from '../utils/constants';
	import Loader from './Loader.svelte';
	
	import FilePreview from './FilePreview.svelte';
	import Upload from './Upload.svelte';
	import DeleteEventData from '../utils/deleteEventData.svelte';

    export let event;
    export let profiles;
    export let submit;
    export let opinionContent;
    export let selectPositive;
    export let selectNeutral;
    export let selectNegative;
    export let newOpinion;
    export let editLvl;
    export let name;
    export let count;
 
    let replyEvents=[];
    let reactions = [];
    let expertOpinions;
    let likeCount = 0;
    let dislikeCount = 0;
    let edit = false;
    let reply = false;
    let replyCount = 0;
    let replyContent = false;
    let loading = true;
    let liked = false;
    let disliked = false;
    let showFullText = false;
    let ATag = event.id;
    let isDeleted = false;
    
    let fileArray=[];

    const maxLength = 500;

    if(editLvl === 0) {
        ATag = kindOpinion+":"+event.pubkey+":"+name;
    }

    function toggleFullText() {
        showFullText = !showFullText;
    }

    function truncateText(text, length) {
        return text.length > length ? text.slice(0, length) + "..." : text;
    }

    function selectSentiment(sentiment) {
        newOpinion.sentiment = sentiment;
        selectPositive = sentiment === '1';
        selectNeutral = sentiment === '0';
        selectNegative = sentiment === '-1';
    };

    async function likePost(event){
        !$ndk.signer && await NDKlogin();
        if(!$ndkUser) return;
        let idx = reactions.findIndex((e)=> e.pubkey === $ndkUser.pubkey)
        let content = '+';
        if(idx != -1) {
            if(reactions[idx].content === '+'){
                content = '';
            } else {
                content = '+';
            }
        } 
        const ndkEvent = new NDKEvent($ndk);
        ndkEvent.kind = kindReaction;
        ndkEvent.content = content;
        ndkEvent.tags = [["a",ATag],["p",$ndkUser.pubkey]];
        await ndkEvent.publish()
        idx = reactions.findIndex((e)=> e.pubkey === $ndkUser.pubkey)
        if(idx != -1) {
            reactions[idx] = {pubkey:$ndkUser.pubkey,content,timestamp:Date.now()};
        } else {
            reactions.push({pubkey:$ndkUser.pubkey,content,timestamp:Date.now()});
        }
        likeCount = reactions.filter((e)=>(e.content === '+')).length;
        dislikeCount = reactions.filter((e)=>(e.content === '-')).length;
        if(content === '+'){
            liked = true;
            disliked = false;
        } else {
            liked = false;
            disliked = false;
        }       
    };
    async function dislikePost(event){
        !$ndk.signer && await NDKlogin();
        if(!$ndkUser) return;
        let idx = reactions.findIndex((e)=> e.pubkey === $ndkUser.pubkey);
        let content = '-';
        if(idx != -1) {
            if(reactions[idx].content === '-'){
                content = '';
            } else {
                content = '-';
            }
        } 
        const ndkEvent = new NDKEvent($ndk);
        ndkEvent.kind = kindReaction;
        ndkEvent.content=content;
        ndkEvent.tags = [["a",ATag],["p",$ndkUser.pubkey]];
        await ndkEvent.publish();
        idx = reactions.findIndex((e)=> e.pubkey === $ndkUser.pubkey);
        if(idx != -1) {
            reactions[idx] = {pubkey:$ndkUser.pubkey,content,timestamp:Date.now()};
        } else {
            reactions.push({pubkey:$ndkUser.pubkey,content,timestamp:Date.now()});
        }
        likeCount = reactions.filter((e)=>(e.content === '+')).length;
        dislikeCount = reactions.filter((e)=>(e.content === '-')).length;
        if(content === '-'){
            liked = false;
            disliked = true;
        } else {
            liked = false;
            disliked = false;
        }
    };

    onMount(async () => {
        expertOpinions = (await import('../main')).expertOpinions;
    
        editLvl+=1;
        let ndkFilter : NDKFilter = {kinds:[kindNotes],"#a":[ATag]};
        let fetchedEvents = await $ndk.fetchEvents(ndkFilter,{closeOnEose:true,groupable:true});
        fetchedEvents.forEach(async(event1)=>{
            replyEvents.push({...event1});
            replyCount = replyEvents.length;
            const content = await fetchUserProfile(event1.pubkey);
            if(!content.image)
                content.image = profileImageUrl+event1.pubkey ;
            if(!content.pubkey)
                content.pubkey = event1.pubkey;
            profiles[event1.pubkey] = {content};
        });

        let latestTime = 0;

        ndkFilter = {kinds:[kindReaction],"#a":[ATag]};
        let fetchedReactionEvents = await $ndk.fetchEvents(ndkFilter,{closeOnEose:true,groupable:true});
        fetchedReactionEvents.forEach((event2)=>{
            let idx = reactions.findIndex((e)=> e.pubkey === event2.pubkey)
                if(idx != -1) {
                    if(reactions[idx].timestamp < event2.created_at)
                    {reactions[idx] = {pubkey:event2.pubkey,content:event2.content,timestamp:event2.created_at};}
                } else {
                    reactions.push({pubkey:event2.pubkey,content:event2.content,timestamp:event2.created_at});
                }
                likeCount = reactions.filter((e)=>(e.content === '+')).length;
                dislikeCount = reactions.filter((e)=>(e.content === '-')).length;
                if($ndkUser?.pubkey && event2.pubkey === $ndkUser.pubkey && latestTime < event2.created_at){
                    latestTime = event2.created_at;
                    if(event2.content === '+'){
                        liked = true;
                        disliked = false;
                    } else if(event2.content === '-'){
                        liked = false;
                        disliked = true;
                    } else {
                        liked = false;
                        disliked = false;
                    }
                }
        })
        loading = false;
    });

    const submitReply = async() =>{
        !$ndk.signer && await NDKlogin();
        if(opinionContent === '' || !opinionContent)
        return;
        console.log(event);
        const ndkEvent = new NDKEvent($ndk);
        ndkEvent.kind = kindNotes;
        ndkEvent.content = opinionContent;
        ndkEvent.tags = [["a",ATag],["p",$ndkUser.pubkey]];
        await ndkEvent.publish();
        replyEvents.push({...ndkEvent});
        replyCount = replyEvents.length;
        opinionContent="";       
	}
    function deleteFile(fileToDelete) {
        const url = fileArray.filter(file => file === fileToDelete)[0].url;
        opinionContent = opinionContent.replace(url,"");
        fileArray = fileArray.filter(file => file !== fileToDelete);
    }
</script>
{#if !isDeleted}
{#if !loading && expertOpinions}
<div class="opinion-container" style="border: 1px solid #e0e0e0; border-radius: 8px; padding: 16px; margin-bottom: 16px; background-color: #fff;">
    <div class="opinion-top" style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 12px;">
        <div class="pubkey" style="display: flex; align-items: center; gap: 10px; font-size: 16px; font-weight: 500;">
            <div>
                {#if event.tags.find((tag) => tag[0] === 'sentiment')?.[1] === '-1'}
                    <Negative />
                {:else if event.tags.find((tag) => tag[0] === 'sentiment')?.[1] === '0'}
                    <Neutral />
                {:else}
                    <Positive />
                {/if}
            </div>
            {#if profiles[event.pubkey]}
                <div style="display: flex; align-items: center; gap: 0.5rem;">
                    <img src={profiles[event.pubkey].content?.image ? profiles[event.pubkey].content?.image :profileImageUrl+event.pubkey} alt="Profile Picture" style="border-radius: 50%; width: 40px; height: 40px; object-fit: cover;"/>
                    <span>
                        {profiles[event.pubkey].content?.name || convertNostrPubKeyToBech32(event.pubkey).slice(0,8)+"..."+convertNostrPubKeyToBech32(event.pubkey).slice(-4)}
                    </span>
                </div>
            {:else}
                <div style="display: flex; align-items: center; gap: 0.5rem;">
                    <img src={profileImageUrl+event.pubkey } alt="Miranda" style="display: block; border-radius: 50%; width: 40px; height: 40px; object-fit: cover;"/>
                    <span>{convertNostrPubKeyToBech32(event.pubkey).slice(0,8)+"..."+convertNostrPubKeyToBech32(event.pubkey).slice(-4)}</span>
                </div>
            {/if}
            {#if expertOpinions.trustedAuthors.includes(event.pubkey)}
                <ApprovedBadge />
            {/if}
        </div>
        <p class="date" style="color: #757575; font-size: 14px;">
            {new Date(event.created_at * 1000).toLocaleDateString()}
        </p>
    </div>
    {#if !edit}
    <p class="content" style="color: #333; margin-bottom: 16px;">
        {@html showFullText ? marked(event.content) : marked(truncateText(event.content, maxLength))}
        {#if event.content.length > maxLength}
            <span class="read-more" on:click={toggleFullText} style="color: var(--button-background-color); cursor: pointer;">
                {showFullText ? ' Read Less' : ' Read More'}
            </span>
        {/if}
    </p>
    {:else}
    <div style="margin: 2rem 0;">
        <form on:submit|preventDefault={submit}>
            <Editor bind:opinionContent={opinionContent} />
            <div id="sentiment-box" style="display:flex; flex-direction:column; gap:0.3rem; margin-bottom: 1rem;">
                <label for="sentiment" style="font-weight: 600;">Choose your overall sentiment</label>
                <div style="display:flex; gap: 0.4rem;">
                    <button on:click|preventDefault={() => selectSentiment('1')} style="border-radius: 3px; width: 7rem; height: 3rem; cursor: pointer; border: none; display:flex; justify-content:center; align-items:center; {selectPositive ? 'background-color: #4DA84D; color: white;' : ''}">
                        <Positive/> <span>Positive</span>
                    </button>
                    <button on:click|preventDefault={() => selectSentiment('0')} style="border-radius: 3px; width: 7rem; height: 3rem; cursor: pointer; border: none; display:flex; justify-content:center; align-items:center; {selectNeutral ? 'background-color: #4DA84D; color: white;' : ''}">
                        <Neutral/> <span>Neutral</span>
                    </button>
                    <button on:click|preventDefault={() => selectSentiment('-1')} style="border-radius: 3px; width: 7rem; height: 3rem; cursor: pointer; border: none; display:flex; justify-content:center; align-items:center; {selectNegative ? 'background-color: #4DA84D; color: white;' : ''}">
                        <Negative/> <span>Negative</span>
                    </button>
                </div>
            </div>

            <button type="submit" disabled={!$ndkUser} style="color: var(--button-text-color); background-color: var(--button-background-color); padding: 7px 20px; border-radius: 3px; cursor: pointer; border: none; height: 2.5rem;">
                Post
            </button>
        </form>
    </div>
    {/if}
    <div style="display: flex; gap: 2rem;">
        <div class="card-button" style="display: inline-flex; align-items: center; gap: 2px;">
            <button on:click={() => likePost(event)} style="background-color: transparent; border: none; cursor: pointer; display: flex; align-items: center; padding: 8px;">
                {#if liked === true}
                    <LikedButton/>
                {:else}
                    <LikeButton/>
                {/if}
            </button>
            <span style="font-size: 14px;">{likeCount|| 0}</span>
        </div>
        <div class="card-button" style="display: inline-flex; align-items: center; gap: 2px;">
            <button on:click={() => dislikePost(event)} style="background-color: transparent; border: none; cursor: pointer; display: flex; align-items: center; padding: 8px;">
                    {#if disliked === true}
                        <DislikedButton/>
                    {:else}
                        <DislikeButton/>
                    {/if}
            </button>
            <span style="font-size: 14px;">{dislikeCount || 0}</span>
        </div>
        <div class="card-button" style="display: inline-flex; align-items: center; gap: 2px;">
            <button on:click={() => {reply = !reply; edit=false;opinionContent="";replyContent=false;}} style="background-color: transparent; border: none; cursor: pointer;">
                <ReplyButton/>
            </button>
            <button on:click={()=>{replyContent=!replyContent;}} style="background-color: transparent; border: none; cursor: pointer; display: flex; align-items: center; padding: 8px;"><span style="font-size: 14px; pointer:cursor;">{replyCount}</span></button>
        </div>
    
        {#if $ndkUser?.pubkey === event.pubkey}
            <DeleteEventData eventID={event.id} bind:isDeleted bind:count/>
        {/if}
        {#if $ndkUser?.pubkey === event.pubkey && editLvl == 1}
        <div class="card-button" style="display: inline-flex; align-items: center; gap: 2px;">
            <button on:click={() => {edit=!edit;opinionContent=event.content;reply = false;replyContent=false;}} style="background-color: transparent; border: none; cursor: pointer; display: flex; align-items: center; padding: 8px;">
                <OptionButton/>
            </button>
        </div>
        {/if}
    </div>
    {#if reply}
		<Editor bind:opinionContent />
        <div style="display:flex; gap:1rem; overflow:scroll;margin:1rem 0;">
        {#each fileArray as file, index (file.url)}
        <FilePreview key={index} file={file.files} onDelete={() => deleteFile(file)} />
        {/each}
        </div>
        <div style="display:flex; align-contents:center;">
		<button style="padding: 7px 20px; border-radius: 3px;cursor: pointer;border: none;height: 2.5rem; background-color:#4DA84D;color:white" disabled={!$ndkUser} on:click={()=>{submitReply();reply=false;replyContent=false;}}>Reply</button>
        <Upload bind:fileArray bind:opinionContent/>
        </div>
	{/if}
    {#if replyContent}
    {#each replyEvents as event (event.id)} 
    <!-- Event loading!!! -->
    <OpinionCard {event} {profiles} {submit} bind:opinionContent {selectPositive} {selectNeutral} {selectNegative} {newOpinion} {editLvl} {name} bind:count = {replyCount}/>
    {/each}
    {/if}
</div>
{:else}
	<p style="display:flex;justify-content:center;align-items:center;margin:2rem 0;"><Loader/></p>
{/if}
{/if}