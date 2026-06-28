import { NextResponse } from "next/server";
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

  const { data, error } = await supabase
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

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ id: data.id });
}
