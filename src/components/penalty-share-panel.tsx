"use client";
import { Check, Globe2, Lock, Share2 } from "lucide-react";
import { useState } from "react";
import { disablePenaltyPublicShare, enablePenaltyPublicShare } from "@/app/penalties/[id]/actions";
import StoryShareButton from "@/components/story-share-button";

export default function PenaltySharePanel({penaltyId,isPublic,username,title}:{penaltyId:string;isPublic:boolean;username:string;title:string}){
 const [publicNow,setPublicNow]=useState(isPublic);const [busy,setBusy]=useState(false);const [copied,setCopied]=useState(false);
 async function share(){setBusy(true);try{if(!publicNow){await enablePenaltyPublicShare(penaltyId);setPublicNow(true)}const url=`${window.location.origin}/challenge/${penaltyId}`;const text=`${username} ha perso 😈 Deve: ${title}`;if(navigator.share){await navigator.share({title:"PayUp · Penitenza",text,url});return}await navigator.clipboard.writeText(url);setCopied(true);setTimeout(()=>setCopied(false),1500)}catch{}finally{setBusy(false)}}
 async function makePrivate(){setBusy(true);try{await disablePenaltyPublicShare(penaltyId);setPublicNow(false)}finally{setBusy(false)}}
 return <section className="rounded-3xl border border-fuchsia-400/20 bg-gradient-to-br from-fuchsia-500/10 to-zinc-900 p-5"><div className="flex items-center gap-2 text-fuchsia-300"><Globe2 size={19}/><p className="font-black">Condividi la sconfitta</p></div><p className="mt-2 text-sm leading-6 text-zinc-400">Il link pubblico mostra solo la penitenza e invita chi lo apre a entrare in PayUp. Premendo Condividi la rendi pubblica.</p><div className="mt-4 flex flex-wrap gap-2"><button onClick={share} disabled={busy} className="flex h-11 items-center gap-2 rounded-full bg-fuchsia-500 px-4 text-sm font-black text-white disabled:opacity-50">{copied?<Check size={17}/>:<Share2 size={17}/>} {busy?"Attendi…":copied?"Copiato":"Condividi link"}</button>{publicNow&&<StoryShareButton imagePath={`/challenge/${penaltyId}/story`} filename={`payup-${username}-story.png`} text={`${username} ha perso 😈 ${title}`}/>} {publicNow&&<button onClick={makePrivate} disabled={busy} className="flex h-11 items-center gap-2 rounded-full bg-zinc-800 px-4 text-sm font-black text-zinc-300"><Lock size={16}/>Rendi privato</button>}</div>{publicNow&&<p className="mt-3 text-xs font-bold text-lime-300">🌍 Link pubblico attivo</p>}</section>
}
