import { NextResponse } from "next/server";
import { applyAnalysisResults } from "@/lib/analysis/apply-results";
import { runSessionAnalysis } from "@/lib/analysis/run-analysis";
import { createClient } from "@/lib/supabase/server";
import type { TranscriptEntry } from "@/lib/types/database";

type SessionPayload = {
  startedAt: string;
  scenario?: string;
  transcript: TranscriptEntry[];
  inputTokens?: number;
  outputTokens?: number;
  estCost?: number;
};

export async function POST(request: Request) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = (await request.json()) as SessionPayload;

  if (!body.startedAt || !Array.isArray(body.transcript)) {
    return NextResponse.json({ error: "Invalid payload" }, { status: 400 });
  }

  const { data: profile } = await supabase
    .from("profiles")
    .select("household_id, cefr_level")
    .eq("id", user.id)
    .single();

  if (!profile) {
    return NextResponse.json({ error: "Profile not found" }, { status: 400 });
  }

  const { data: session, error: sessionError } = await supabase
    .from("sessions")
    .insert({
      user_id: user.id,
      started_at: body.startedAt,
      ended_at: new Date().toISOString(),
      scenario: body.scenario ?? null,
      transcript: body.transcript,
      input_tokens: body.inputTokens ?? null,
      output_tokens: body.outputTokens ?? null,
      est_cost: body.estCost ?? null,
    })
    .select("id")
    .single();

  if (sessionError || !session) {
    return NextResponse.json(
      { error: sessionError?.message ?? "Could not save session" },
      { status: 500 },
    );
  }

  const analysis = await runSessionAnalysis({
    transcript: body.transcript,
    currentLevel: profile.cefr_level,
    scenario: body.scenario,
  });

  let analysisFailed = false;

  if (analysis) {
    try {
      await applyAnalysisResults(supabase, {
        userId: user.id,
        sessionId: session.id,
        householdId: profile.household_id,
        analysis,
      });
    } catch (error) {
      console.error("Failed to apply analysis:", error);
      analysisFailed = true;
    }
  } else {
    analysisFailed = true;
  }

  return NextResponse.json({
    id: session.id,
    debrief: analysis
      ? {
          sessionId: session.id,
          errors: analysis.errors,
          new_vocab: analysis.new_vocab,
          suggested_focus: analysis.suggested_focus,
          difficulty_read: analysis.difficulty_read,
          analysisFailed,
        }
      : {
          sessionId: session.id,
          errors: [],
          new_vocab: [],
          suggested_focus: "We saved your session but could not analyse it this time.",
          difficulty_read: null,
          analysisFailed: true,
        },
  });
}
