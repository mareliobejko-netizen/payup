"use client";
import { usePathname,useRouter } from "next/navigation";
import { useRef } from "react";
const tabs=['/','/feed','/ranking','/profile'];
export default function MobileSwipeNav(){const path=usePathname();const router=useRouter();const start=useRef<{x:number;y:number}|null>(null);const index=tabs.indexOf(path);if(index<0)return null;return <div className="fixed inset-0 z-[-1]" onTouchStart={e=>{const t=e.touches[0];start.current={x:t.clientX,y:t.clientY}}} onTouchEnd={e=>{if(!start.current)return;const t=e.changedTouches[0],dx=t.clientX-start.current.x,dy=t.clientY-start.current.y;start.current=null;if(Math.abs(dx)<90||Math.abs(dx)<Math.abs(dy)*1.5)return;if(dx<0&&index<tabs.length-1)router.push(tabs[index+1]);if(dx>0&&index>0)router.push(tabs[index-1]);}}/>}
