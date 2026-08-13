import Link from "next/link";
import { ArrowRight, BadgeCheck, Camera, Heart, ShieldCheck, Skull, Trophy, UsersRound } from "lucide-react";
import { getCurrentUser } from "@/lib/auth";
import Dashboard from "./dashboard";

export const dynamic = "force-dynamic";

export default async function HomePage() {
  const user = await getCurrentUser();
  if (user) return <Dashboard />;

  return (
    <main className="min-h-screen bg-zinc-950 text-white">
      <header className="mx-auto flex max-w-6xl items-center justify-between px-5 py-5">
        <Link href="/" className="flex items-center gap-2 font-black"><span className="flex h-10 w-10 items-center justify-center rounded-2xl bg-lime-400 text-black"><Skull size={22}/></span>PayUp</Link>
        <div className="flex gap-2"><Link href="/login" className="rounded-xl px-4 py-2 text-sm font-black text-zinc-300">Accedi</Link><Link href="/register" className="rounded-xl bg-lime-400 px-4 py-2 text-sm font-black text-black">Registrati</Link></div>
      </header>

      <section className="mx-auto grid max-w-6xl gap-10 px-5 pb-16 pt-12 md:grid-cols-2 md:items-center md:pt-24">
        <div>
          <span className="rounded-full border border-lime-400/20 bg-lime-400/10 px-4 py-2 text-xs font-black uppercase tracking-[.22em] text-lime-300">La vergogna non si dimentica più 😈</span>
          <h1 className="mt-6 text-5xl font-black leading-[.95] tracking-tight md:text-7xl">Chi perde,<br/><span className="text-lime-400">paga.</span><br/>E deve provarlo.</h1>
          <p className="mt-6 max-w-xl text-lg leading-8 text-zinc-400">Crea il gruppo con i tuoi amici, assegna penitenze, carica foto o video come prova e fate decidere al gruppo se è stata completata davvero.</p>
          <div className="mt-8 flex flex-col gap-3 sm:flex-row"><Link href="/register" className="flex h-14 items-center justify-center gap-2 rounded-2xl bg-lime-400 px-6 font-black text-black">CREA IL TUO GRUPPO <ArrowRight size={19}/></Link><Link href="/feed" className="flex h-14 items-center justify-center rounded-2xl border border-white/10 bg-zinc-900 px-6 font-black">🔥 Guarda The Wall</Link></div>
        </div>
        <div className="rounded-[2rem] border border-white/10 bg-zinc-900 p-4 shadow-2xl shadow-lime-400/5">
          <div className="rounded-3xl bg-zinc-950 p-5"><div className="flex items-center gap-3"><div className="flex h-12 w-12 items-center justify-center rounded-full bg-lime-400 font-black text-black">M</div><div><p className="font-black">@Marco</p><p className="text-xs text-zinc-500">The Boys · ✅ FATTO PER DAVVERO</p></div></div><div className="mt-4 rounded-2xl bg-zinc-900 p-4 font-bold">🤡 Doveva offrire una pizza a tutto il gruppo</div><div className="mt-3 flex aspect-video items-center justify-center rounded-2xl bg-gradient-to-br from-zinc-800 to-zinc-700 text-6xl">📸</div><div className="mt-4 flex items-center gap-2 font-black"><Heart size={19} className="text-red-400"/> 184 <span className="ml-auto text-xs text-zinc-500">APPROVATA DAL GRUPPO</span></div></div>
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-5 py-16"><div className="grid gap-4 md:grid-cols-3"><Feature icon={<UsersRound/>} title="Gruppi privati" text="Un account, tanti gruppi. Calcetto, FIFA, poker o qualsiasi altra sfida."/><Feature icon={<Camera/>} title="Prove vere" text="Carica, scatta una foto o registra un video direttamente dal telefono."/><Feature icon={<BadgeCheck/>} title="Gli amici decidono" text="CONFERMO o FAKE. Solo dopo i voti la penitenza è davvero completata."/><Feature icon={<Trophy/>} title="Hall of Shame" text="Ranking e titoli per scoprire chi perde sempre e chi paga davvero."/><Feature icon={<Heart/>} title="The Wall" text="Pubblica le prove più divertenti e falle vedere anche a chi non è registrato."/><Feature icon={<ShieldCheck/>} title="Privato quando vuoi" text="Se non scegli The Wall, la prova resta visibile solo nel gruppo."/></div></section>

      <section className="border-t border-white/5 bg-zinc-900/40"><div className="mx-auto max-w-3xl px-5 py-20 text-center"><p className="text-5xl">💀</p><h2 className="mt-5 text-4xl font-black">Nel tuo gruppo qualcuno perde sempre?</h2><p className="mt-4 text-zinc-400">Adesso almeno non potrà far finta di essersene dimenticato.</p><Link href="/register" className="mt-7 inline-flex h-14 items-center rounded-2xl bg-lime-400 px-7 font-black text-black">INIZIA GRATIS</Link></div></section>
    </main>
  );
}

function Feature({icon,title,text}:{icon:React.ReactNode;title:string;text:string}) { return <div className="rounded-3xl border border-white/5 bg-zinc-900 p-6"><div className="text-lime-400">{icon}</div><h3 className="mt-4 text-xl font-black">{title}</h3><p className="mt-2 text-sm leading-6 text-zinc-500">{text}</p></div> }
