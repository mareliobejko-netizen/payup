import Link from "next/link";
import { Mail, ShieldCheck, Skull, UserRound } from "lucide-react";
import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/auth";
import { AVATAR_PRESETS } from "@/lib/avatar-system";
import { registerAction } from "./actions";

type RegisterPageProps = {
  searchParams: Promise<{ error?: string; next?: string }>;
};

export default async function RegisterPage({ searchParams }: RegisterPageProps) {
  if (await getCurrentUser()) redirect("/");
  const { error, next } = await searchParams;

  return (
    <main className="min-h-screen bg-zinc-950 px-5 py-8 text-white">
      <div className="mx-auto max-w-md">
        <div className="mb-7 text-center">
          <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-3xl bg-lime-400 text-black">
            <Skull size={30} />
          </div>
          <h1 className="mt-4 text-3xl font-black">Crea il tuo account</h1>
          <p className="mt-2 text-sm text-zinc-500">Crea l&apos;account e scegli subito il tuo teschio 💀</p>
        </div>

        <form action={registerAction} className="space-y-5 rounded-3xl border border-white/10 bg-zinc-900 p-5">
          {next && <input type="hidden" name="next" value={next} />}
          {error && (
            <div className="rounded-2xl border border-red-500/20 bg-red-500/10 px-4 py-3 text-sm font-bold text-red-300">
              {error}
            </div>
          )}

          <Field icon={<UserRound size={16} />} label="Username">
            <input name="username" required minLength={3} maxLength={30} autoComplete="username" className="h-14 w-full rounded-2xl border border-white/10 bg-zinc-950 px-4 outline-none placeholder:text-zinc-600 focus:border-lime-400" placeholder="Username" />
          </Field>

          <Field icon={<Mail size={16} />} label="Email">
            <input name="email" type="email" required autoComplete="email" className="h-14 w-full rounded-2xl border border-white/10 bg-zinc-950 px-4 outline-none placeholder:text-zinc-600 focus:border-lime-400" placeholder="nome@email.it" />
          </Field>

          <Field icon={<ShieldCheck size={16} />} label="Password">
            <input name="password" type="password" required minLength={6} autoComplete="new-password" className="h-14 w-full rounded-2xl border border-white/10 bg-zinc-950 px-4 outline-none placeholder:text-zinc-600 focus:border-lime-400" placeholder="Password" />
          </Field>

          <Field icon={<ShieldCheck size={16} />} label="Conferma password">
            <input name="confirmPassword" type="password" required minLength={6} autoComplete="new-password" className="h-14 w-full rounded-2xl border border-white/10 bg-zinc-950 px-4 outline-none placeholder:text-zinc-600 focus:border-lime-400" placeholder="Ripeti la password" />
          </Field>

          <fieldset>
            <legend className="text-sm font-black text-zinc-300">Scegli il tuo teschio 💀</legend>
            <p className="mt-1 text-xs text-zinc-500">Potrai cambiarlo quando vuoi dal profilo o caricare una tua foto.</p>
            <div className="mt-4 grid grid-cols-5 gap-2">
              {AVATAR_PRESETS.map((avatar, index) => (
                <label key={avatar.id} className="cursor-pointer text-center">
                  <input type="radio" name="avatarUrl" value={avatar.url} defaultChecked={index === 0} className="peer sr-only" />
                  <span className="block rounded-2xl border-2 border-transparent bg-zinc-950 p-1 transition peer-checked:border-lime-400 peer-checked:bg-lime-400/10">
                    <img src={avatar.url} alt={avatar.label} className="aspect-square w-full rounded-xl object-cover" />
                  </span>
                  <span className="mt-1 block truncate text-[9px] font-bold text-zinc-500 peer-checked:text-lime-300">{avatar.label}</span>
                </label>
              ))}
            </div>
          </fieldset>

          <button className="h-14 w-full rounded-2xl bg-lime-400 font-black text-black">CREA ACCOUNT</button>
        </form>

        <p className="mt-6 text-center text-sm text-zinc-500">
          Hai già un account?{" "}
          <Link href={next ? `/login?next=${encodeURIComponent(next)}` : "/login"} className="font-black text-lime-400">Accedi</Link>
        </p>
      </div>
    </main>
  );
}

function Field({ icon, label, children }: { icon: React.ReactNode; label: string; children: React.ReactNode }) {
  return <label className="block"><span className="mb-2 flex items-center gap-2 text-sm font-black text-zinc-300"><span className="text-lime-400">{icon}</span>{label}</span>{children}</label>;
}
