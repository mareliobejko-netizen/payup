import type { Metadata, Viewport } from "next";
import "./globals.css";
import PwaManager from "@/components/pwa-manager";
import MobileSwipeNav from "@/components/mobile-swipe-nav";
import GlobalToast from "@/components/global-toast";
import { Suspense } from "react";
export const metadata:Metadata={title:{default:"PayUp",template:"%s · PayUp"},description:"Chi perde paga. E deve provarlo.",applicationName:"PayUp",appleWebApp:{capable:true,statusBarStyle:"black-translucent",title:"PayUp"},formatDetection:{telephone:false},icons:{apple:"/icons/apple-touch-icon.png"}};
export const viewport:Viewport={themeColor:"#a3e635",viewportFit:"cover"};
export default function RootLayout({children}:{children:React.ReactNode}){return <html lang="it"><body className="bg-zinc-950 antialiased"><PwaManager/><MobileSwipeNav/><Suspense fallback={null}><GlobalToast/></Suspense>{children}</body></html>}
