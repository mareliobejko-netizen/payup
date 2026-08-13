import Link from "next/link";
import {
  ArrowLeft,
  KeyRound,
  LogOut,
  Mail,
  Pencil,
  Save,
  ShieldCheck,
  UserRound,
} from "lucide-react";
import { requireUser, getMemberships } from "@/lib/auth";
import {
  logoutAction,
  updatePasswordAction,
  updateUsernameAction,
} from "./actions";

type Props = {
  searchParams: Promise<{
    error?: string;
    success?: string;
  }>;
};

export default async function ProfilePage({ searchParams }: Props) {
  const user = await requireUser();
  const memberships = await getMemberships(user.id);
  const params = await searchParams;

  return (
    <main className="min-h-screen bg-zinc-950 text-white">
      <div className="mx-auto min-h-screen max-w-md border-x border-white/5 p-5 pb-10">
        <div className="flex items-center gap-3">
          <Link
            href="/"
            className="flex h-11 w-11 items-center justify-center rounded-full bg-zinc-900"
          >
            <ArrowLeft size={20} />
          </Link>
          <div>
            <p className="text-xs font-black uppercase tracking-[.25em] text-lime-400">
              PayUp
            </p>
            <h1 className="text-xl font-black">Profilo</h1>
          </div>
        </div>

        {params.error && (
          <div className="mt-5 rounded-2xl border border-red-500/20 bg-red-500/10 p-4 text-sm font-bold text-red-300">
            {params.error}
          </div>
        )}

        {params.success && (
          <div className="mt-5 rounded-2xl border border-lime-400/20 bg-lime-400/10 p-4 text-sm font-bold text-lime-300">
            ✓ {params.success}
          </div>
        )}

        <section className="mt-8 rounded-3xl bg-zinc-900 p-5">
          <div className="flex h-16 w-16 items-center justify-center rounded-full bg-lime-400 text-2xl font-black text-black">
            {user.username[0]?.toUpperCase()}
          </div>
          <h2 className="mt-4 text-2xl font-black">@{user.username}</h2>
          <p className="mt-2 flex items-center gap-2 text-sm text-zinc-500">
            <Mail size={15} />
            {user.email}
          </p>
          <p className="mt-3 flex items-center gap-2 text-sm text-zinc-400">
            <UserRound size={15} />
            {memberships.length} {memberships.length === 1 ? "gruppo" : "gruppi"}
          </p>
        </section>

        <section className="mt-5 rounded-3xl border border-white/5 bg-zinc-900 p-5">
          <div className="flex items-center gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-lime-400/10 text-lime-400">
              <Pencil size={19} />
            </div>
            <div>
              <h3 className="font-black">Cambia username</h3>
              <p className="text-xs text-zinc-500">Il nome che vedono gli altri utenti.</p>
            </div>
          </div>

          <form action={updateUsernameAction} className="mt-5 space-y-3">
            <div>
              <label htmlFor="username" className="mb-2 block text-xs font-bold uppercase tracking-wide text-zinc-500">
                Username
              </label>
              <input
                id="username"
                name="username"
                defaultValue={user.username}
                minLength={3}
                maxLength={30}
                autoComplete="username"
                required
                className="h-14 w-full rounded-2xl border border-white/10 bg-zinc-950 px-4 font-semibold outline-none transition focus:border-lime-400"
              />
            </div>

            <button className="flex h-14 w-full items-center justify-center gap-2 rounded-2xl bg-lime-400 px-4 py-3.5 font-black text-black transition active:scale-[0.98]">
              <Save size={18} />
              SALVA USERNAME
            </button>
          </form>
        </section>

        <section className="mt-5 rounded-3xl border border-white/5 bg-zinc-900 p-5">
          <div className="flex items-center gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-amber-400/10 text-amber-300">
              <KeyRound size={19} />
            </div>
            <div>
              <h3 className="font-black">Cambia password</h3>
              <p className="text-xs text-zinc-500">Ti chiediamo prima quella attuale.</p>
            </div>
          </div>

          <form action={updatePasswordAction} className="mt-5 space-y-4">
            <PasswordField
              id="currentPassword"
              name="currentPassword"
              label="Password attuale"
              autoComplete="current-password"
            />
            <PasswordField
              id="newPassword"
              name="newPassword"
              label="Nuova password"
              autoComplete="new-password"
            />
            <PasswordField
              id="confirmPassword"
              name="confirmPassword"
              label="Conferma nuova password"
              autoComplete="new-password"
            />

            <div className="flex items-start gap-2 rounded-2xl bg-zinc-950 p-3 text-xs leading-5 text-zinc-500">
              <ShieldCheck size={16} className="mt-0.5 shrink-0 text-lime-400" />
              La password viene salvata solo in forma cifrata (hash), mai in chiaro.
            </div>

            <button className="flex w-full items-center justify-center gap-2 rounded-2xl bg-white px-4 py-3.5 font-black text-black transition active:scale-[0.98]">
              <KeyRound size={18} />
              CAMBIA PASSWORD
            </button>
          </form>
        </section>

        <form action={logoutAction} className="mt-5">
          <button className="flex h-14 w-full items-center justify-center gap-2 rounded-2xl bg-red-500/10 font-black text-red-400">
            <LogOut size={19} />
            ESCI
          </button>
        </form>
      </div>
    </main>
  );
}

function PasswordField({
  id,
  name,
  label,
  autoComplete,
}: {
  id: string;
  name: string;
  label: string;
  autoComplete: string;
}) {
  return (
    <div>
      <label htmlFor={id} className="mb-2 block text-xs font-bold uppercase tracking-wide text-zinc-500">
        {label}
      </label>
      <input
        id={id}
        name={name}
        type="password"
        minLength={6}
        autoComplete={autoComplete}
        required
        placeholder="••••••••"
        className="h-14 w-full rounded-2xl border border-white/10 bg-zinc-950 px-4 font-semibold outline-none transition placeholder:text-zinc-700 focus:border-lime-400"
      />
    </div>
  );
}
