import Link from "next/link";
import { requireOnboardedProfile } from "@/lib/auth/profile";

export default async function HomePage() {
  const { profile } = await requireOnboardedProfile();

  return (
    <div className="mx-auto flex w-full max-w-lg flex-1 flex-col px-6 py-12">
      <header className="mb-10">
        <p className="text-sm text-stone-500">Ciao, {profile.display_name ?? "learner"}</p>
        <h1 className="mt-1 text-3xl font-semibold tracking-tight text-stone-900">
          Parlai
        </h1>
        <p className="mt-2 text-stone-600">
          Level {profile.cefr_level} · ready when you are.
        </p>
      </header>

      <Link
        href="/session"
        className="mb-8 inline-flex h-14 items-center justify-center rounded-full bg-emerald-800 text-lg font-medium text-white transition hover:bg-emerald-900"
      >
        Inizia
      </Link>

      <div className="rounded-2xl border border-stone-200 bg-white/80 p-5 text-sm text-stone-600">
        <p className="font-medium text-stone-800">Last debrief</p>
        <p className="mt-2">Your post-session notes will appear here from Milestone 4.</p>
      </div>

      <nav className="mt-auto pt-10 text-sm">
        <Link href="/admin/context" className="text-stone-500 underline-offset-4 hover:underline">
          Household context
        </Link>
      </nav>
    </div>
  );
}
