import Link from "next/link";
import { LockKeyhole, LogIn, Skull, UserRound } from "lucide-react";
import { getCurrentUser } from "@/lib/auth";
import { redirect } from "next/navigation";
import { loginAction } from "./actions";

type LoginPageProps = {
  searchParams: Promise<{ error?: string; success?: string; next?: string }>;
};

export default async function LoginPage({ searchParams }: LoginPageProps) {
  if (await getCurrentUser()) redirect("/");
  const { error, success, next } = await searchParams;

  return (
    <main className="min-h-screen bg-zinc-950 px-5 py-10 text-white">
      <div className="mx-auto max-w-md">
        <div className="mb-10 text-center">
          <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-3xl bg-lime-400 text-black">
            <Skull size={38} />
          </div>
          <p className="mt-5 text-xs font-black uppercase tracking-[0.35em] text-lime-400">PayUp</p>
          <h1 className="mt-2 text-4xl font-black">Bentornato 😈</h1>
          <p className="mt-3 text-sm leading-6 text-zinc-500">Entra e controlla chi deve ancora pagare.</p>
        </div>

        <form action={loginAction} className="space-y-4 rounded-3xl border border-white/10 bg-zinc-900 p-5">
          {next && <input type="hidden" name="next" value={next} />}
          {error && (
            <div className="rounded-2xl border border-red-500/20 bg-red-500/10 px-4 py-3 text-sm font-bold text-red-300">{error}</div>
          )}
          {success && <div className="rounded-2xl border border-lime-400/20 bg-lime-400/10 px-4 py-3 text-sm font-bold text-lime-300">✓ {success}</div>}

          <label className="block">
            <span className="mb-2 flex items-center gap-2 text-sm font-black">
              <UserRound size={16} className="text-lime-400" />
              Username o email
            </span>
            <input
              name="identifier"
              autoComplete="username"
              required
              className="h-14 w-full rounded-2xl border border-white/10 bg-zinc-950 px-4 outline-none placeholder:text-zinc-600 focus:border-lime-400"
              placeholder="Username o email"
            />
          </label>

          <label className="block">
            <span className="mb-2 flex items-center gap-2 text-sm font-black">
              <LockKeyhole size={16} className="text-lime-400" />
              Password
            </span>
            <input
              name="password"
              type="password"
              autoComplete="current-password"
              required
              className="h-14 w-full rounded-2xl border border-white/10 bg-zinc-950 px-4 outline-none placeholder:text-zinc-600 focus:border-lime-400"
              placeholder="Password"
            />
          </label>

          <button className="flex h-14 w-full items-center justify-center gap-2 rounded-2xl bg-lime-400 font-black text-black">
            <LogIn size={20} />
            ENTRA
          </button>
        </form>
        <div className="mt-4 text-center"><Link href="/forgot-password" className="text-sm font-bold text-zinc-400 hover:text-white">Password dimenticata?</Link></div>

        <p className="mt-6 text-center text-sm text-zinc-500">
          Non hai un account?{" "}
          <Link href={next ? `/register?next=${encodeURIComponent(next)}` : "/register"} className="font-black text-lime-400">Registrati</Link>
        </p>
      </div>
    </main>
  );
}
