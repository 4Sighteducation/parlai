import type { SessionAnalysisResult } from "@/lib/analysis/types";
import type { createClient } from "@/lib/supabase/server";

const CEFR_LEVELS = ["A1", "A2", "B1", "B2", "C1", "C2"] as const;

function shiftLevel(current: string, direction: "up" | "down") {
  const index = CEFR_LEVELS.indexOf(current as (typeof CEFR_LEVELS)[number]);
  const base = index === -1 ? 1 : index;
  const next =
    direction === "up"
      ? Math.min(base + 1, CEFR_LEVELS.length - 1)
      : Math.max(base - 1, 0);
  return CEFR_LEVELS[next];
}

function mergeWeakPoints(
  existing: unknown,
  errors: SessionAnalysisResult["errors"],
) {
  const current = Array.isArray(existing) ? (existing as string[]) : [];
  const themes = errors.map((error) => error.note).filter(Boolean);
  const merged = [...current];
  for (const theme of themes) {
    if (!merged.includes(theme)) merged.push(theme);
  }
  return merged.slice(-8);
}

export async function applyAnalysisResults(
  supabase: Awaited<ReturnType<typeof createClient>>,
  input: {
    userId: string;
    sessionId: string;
    householdId: string;
    analysis: SessionAnalysisResult;
  },
) {
  const { userId, sessionId, householdId, analysis } = input;

  await supabase.from("session_analysis").insert({
    session_id: sessionId,
    errors: analysis.errors,
    new_vocab: analysis.new_vocab,
    difficulty_read: analysis.difficulty_read,
    suggested_focus: analysis.suggested_focus,
  });

  const { data: learnerState } = await supabase
    .from("learner_state")
    .select("*")
    .eq("user_id", userId)
    .single();

  const strengths =
    learnerState?.strengths &&
    typeof learnerState.strengths === "object" &&
    !Array.isArray(learnerState.strengths)
      ? (learnerState.strengths as Record<string, unknown>)
      : {};

  const lastDifficulty =
    typeof strengths.last_difficulty === "string" ? strengths.last_difficulty : null;

  let currentLevel = learnerState?.current_level ?? "A1";

  if (analysis.difficulty_read === "too_easy" && lastDifficulty === "too_easy") {
    currentLevel = shiftLevel(currentLevel, "up");
  } else if (
    analysis.difficulty_read === "too_hard" &&
    lastDifficulty === "too_hard"
  ) {
    currentLevel = shiftLevel(currentLevel, "down");
  }

  await supabase
    .from("learner_state")
    .update({
      current_level: currentLevel,
      next_focus: analysis.suggested_focus,
      weak_points: mergeWeakPoints(learnerState?.weak_points, analysis.errors),
      strengths: { ...strengths, last_difficulty: analysis.difficulty_read },
      updated_at: new Date().toISOString(),
    })
    .eq("user_id", userId);

  await supabase
    .from("profiles")
    .update({ cefr_level: currentLevel })
    .eq("id", userId);

  for (const item of analysis.new_vocab) {
    const { data: existing } = await supabase
      .from("vocab_items")
      .select("id, ease, due_at")
      .eq("user_id", userId)
      .eq("italian", item.italian)
      .maybeSingle();

    const now = Date.now();
    const dayMs = 24 * 60 * 60 * 1000;

    if (!existing) {
      await supabase.from("vocab_items").insert({
        user_id: userId,
        italian: item.italian,
        english: item.english,
        first_seen_session: sessionId,
        ease: 2.5,
        due_at: new Date(now + dayMs).toISOString(),
      });
    } else {
      const previousDue = existing.due_at
        ? new Date(existing.due_at).getTime()
        : now;
      const intervalDays = Math.max(
        1,
        Math.round((previousDue - now) / dayMs) || 1,
      );
      const nextInterval = Math.min(intervalDays * 2, 14);

      await supabase
        .from("vocab_items")
        .update({
          english: item.english,
          ease: Number(existing.ease) + 0.1,
          due_at: new Date(now + nextInterval * dayMs).toISOString(),
        })
        .eq("id", existing.id);
    }
  }

  if (analysis.harvest_proposals.length > 0) {
    const { data: existingLabels } = await supabase
      .from("personal_context")
      .select("label")
      .eq("household_id", householdId);

    const known = new Set(
      (existingLabels ?? []).map((row) => row.label.toLowerCase()),
    );

    const proposals = analysis.harvest_proposals
      .filter((row) => !known.has(row.label.toLowerCase()))
      .map((row) => ({
        household_id: householdId,
        category: row.category,
        label: row.label,
        detail: row.detail,
        tags: row.tags ?? [],
        source: "harvested" as const,
        active: false,
      }));

    if (proposals.length > 0) {
      await supabase.from("personal_context").insert(proposals);
    }
  }
}
