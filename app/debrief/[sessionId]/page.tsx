import { notFound } from "next/navigation";
import { DebriefView } from "@/components/debrief/debrief-view";
import { requireProfile } from "@/lib/auth/profile";
import type { DebriefData } from "@/lib/analysis/types";
import type { AnalysisError, AnalysisVocab } from "@/lib/analysis/types";

type PageProps = {
  params: Promise<{ sessionId: string }>;
};

export default async function DebriefPage({ params }: PageProps) {
  const { sessionId } = await params;
  const { supabase, user, profile } = await requireProfile();

  const { data: session } = await supabase
    .from("sessions")
    .select("id")
    .eq("id", sessionId)
    .eq("user_id", user.id)
    .maybeSingle();

  if (!session) notFound();

  const { data: analysis } = await supabase
    .from("session_analysis")
    .select("*")
    .eq("session_id", sessionId)
    .maybeSingle();

  const debrief: DebriefData = analysis
    ? {
        sessionId,
        errors: (analysis.errors as AnalysisError[]) ?? [],
        new_vocab: (analysis.new_vocab as AnalysisVocab[]) ?? [],
        suggested_focus: analysis.suggested_focus ?? "Keep practising.",
        difficulty_read:
          (analysis.difficulty_read as DebriefData["difficulty_read"]) ?? null,
      }
    : {
        sessionId,
        errors: [],
        new_vocab: [],
        suggested_focus: "Analysis is still processing or unavailable.",
        difficulty_read: null,
        analysisFailed: true,
      };

  const backHref = profile.onboarded ? "/home" : "/onboarding";

  return <DebriefView debrief={debrief} backHref={backHref} />;
}
