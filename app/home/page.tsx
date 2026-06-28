import Link from "next/link";
import { DebriefCard } from "@/components/debrief/debrief-card";
import { PendingHarvestList } from "@/components/home/pending-harvest-list";
import { requireOnboardedProfile } from "@/lib/auth/profile";
import type { AnalysisError, AnalysisVocab, DebriefData } from "@/lib/analysis/types";

export default async function HomePage() {
  const { supabase, user, profile } = await requireOnboardedProfile();

  const { data: latestSession } = await supabase
    .from("sessions")
    .select("id, session_analysis(*)")
    .eq("user_id", user.id)
    .order("ended_at", { ascending: false })
    .limit(1)
    .maybeSingle();

  const analysis = latestSession?.session_analysis;
  const analysisRow = Array.isArray(analysis) ? analysis[0] : analysis;

  const lastDebrief: DebriefData | null = analysisRow
    ? {
        sessionId: latestSession!.id,
        errors: (analysisRow.errors as AnalysisError[]) ?? [],
        new_vocab: (analysisRow.new_vocab as AnalysisVocab[]) ?? [],
        suggested_focus: analysisRow.suggested_focus ?? "Keep practising.",
        difficulty_read:
          (analysisRow.difficulty_read as DebriefData["difficulty_read"]) ?? null,
      }
    : null;

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

      <div className="mb-8 space-y-6">
        <PendingHarvestList />

        {lastDebrief ? (
          <div>
            <p className="mb-3 text-xs font-medium tracking-wide text-stone-500 uppercase">
              Last debrief
            </p>
            <DebriefCard debrief={lastDebrief} />
          </div>
        ) : (
          <div className="rounded-2xl border border-stone-200 bg-white/80 p-5 text-sm text-stone-600">
            <p className="font-medium text-stone-800">Last debrief</p>
            <p className="mt-2">Complete a session to see Giulia&apos;s notes here.</p>
          </div>
        )}
      </div>

      <nav className="mt-auto pt-10 text-sm">
        <Link href="/admin/context" className="text-stone-500 underline-offset-4 hover:underline">
          Household context
        </Link>
      </nav>
    </div>
  );
}
