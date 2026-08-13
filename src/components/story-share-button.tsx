"use client";
import { Download, ImageDown } from "lucide-react";
import { useState } from "react";

export default function StoryShareButton({ imagePath, filename = "payup-story.png", text = "Guarda su PayUp 😈" }:{imagePath:string;filename?:string;text?:string}){
 const [working,setWorking]=useState(false);
 async function share(){
  setWorking(true);
  try{
   const res=await fetch(imagePath,{cache:"no-store"}); if(!res.ok) throw new Error("image");
   const blob=await res.blob(); const file=new File([blob],filename,{type:"image/png"});
   const data={files:[file],title:"PayUp",text};
   if(navigator.share && (!navigator.canShare || navigator.canShare({files:[file]}))){await navigator.share(data);return;}
   const url=URL.createObjectURL(blob);const a=document.createElement("a");a.href=url;a.download=filename;a.click();setTimeout(()=>URL.revokeObjectURL(url),1000);
  }catch{} finally{setWorking(false)}
 }
 return <button type="button" onClick={share} disabled={working} className="flex items-center gap-2 rounded-full bg-fuchsia-500/10 px-4 py-2 text-sm font-black text-fuchsia-300 disabled:opacity-50">{working?<Download size={17}/>:<ImageDown size={17}/>} {working?"Preparo…":"Story Card"}</button>
}
