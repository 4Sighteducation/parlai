import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { buildSessionInstructions } from "@/lib/realtime/tutor-prompt";

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
    .select("cefr_level")
    .eq("id", user.id)
    .single();

  const model = process.env.REALTIME_MODEL ?? "gpt-realtime-2";
  const instructions = buildSessionInstructions(profile?.cefr_level ?? "A2");

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
            voice: "cedar",
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
  return NextResponse.json(data);
}
