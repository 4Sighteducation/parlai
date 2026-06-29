import { NextResponse } from "next/server";
import { assembleContextBlock, pickScenario } from "@/lib/realtime/assemble-context";
import { buildSessionInstructions, REALTIME_VOICE } from "@/lib/realtime/tutor-prompt";
import { createClient } from "@/lib/supabase/server";

export async function POST() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) {
    return NextResponse.json(
      { error: "OPENAI_API_KEY is not configured" },
      { status: 500 },
    );
  }

  const { data: profile } = await supabase
    .from("profiles")
    .select("cefr_level, onboarded, household_id")
    .eq("id", user.id)
    .single();

  if (!profile) {
    return NextResponse.json({ error: "Profile not found" }, { status: 400 });
  }

  const level = profile.onboarded ? profile.cefr_level : "A1";

  const [{ data: learnerState }, { data: dueVocab }, { data: personalContext }] =
    await Promise.all([
      supabase.from("learner_state").select("*").eq("user_id", user.id).maybeSingle(),
      supabase
        .from("vocab_items")
        .select("*")
        .eq("user_id", user.id)
        .lte("due_at", new Date().toISOString())
        .limit(6),
      supabase
        .from("personal_context")
        .select("*")
        .eq("household_id", profile.household_id)
        .eq("active", true)
        .limit(12),
    ]);

  const scenario = pickScenario({
    level,
    onboarded: profile.onboarded,
    nextFocus: learnerState?.next_focus,
  });

  const contextBlock = assembleContextBlock({
    level,
    scenario,
    learnerState,
    dueVocab: dueVocab ?? [],
    personalContext: personalContext ?? [],
  });

  const instructions = buildSessionInstructions(contextBlock);
  const model = process.env.REALTIME_MODEL ?? "gpt-realtime-2";
  const voice = process.env.REALTIME_VOICE ?? REALTIME_VOICE;

  const response = await fetch("https://api.openai.com/v1/realtime/client_secrets", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
      "OpenAI-Safety-Identifier": user.id,
    },
    body: JSON.stringify({
      session: {
        type: "realtime",
        model,
        instructions,
        audio: {
          input: {
            transcription: { model: "gpt-4o-mini-transcribe" },
            turn_detection: { type: "semantic_vad" },
          },
          output: {
            voice,
          },
        },
      },
    }),
  });

  if (!response.ok) {
    const detail = await response.text();
    return NextResponse.json(
      { error: "Failed to mint realtime token", detail },
      { status: response.status },
    );
  }

  const data = await response.json();
  return NextResponse.json({
    ...data,
    scenario,
    level,
  });
}
