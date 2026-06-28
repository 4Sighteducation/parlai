import {
  ANALYSIS_JSON_SCHEMA,
  ANALYSIS_SYSTEM_PROMPT,
  buildAnalysisUserPrompt,
} from "@/lib/analysis/prompts";
import type { SessionAnalysisResult } from "@/lib/analysis/types";
import type { TranscriptEntry } from "@/lib/types/database";

function stripCodeFences(text: string) {
  return text
    .trim()
    .replace(/^```(?:json)?\s*/i, "")
    .replace(/\s*```$/i, "")
    .trim();
}

export function parseAnalysisJson(raw: string): SessionAnalysisResult | null {
  try {
    const parsed = JSON.parse(stripCodeFences(raw)) as SessionAnalysisResult;
    if (
      !parsed ||
      !Array.isArray(parsed.errors) ||
      !Array.isArray(parsed.new_vocab) ||
      !parsed.suggested_focus
    ) {
      return null;
    }
    return {
      errors: parsed.errors.slice(0, 3),
      new_vocab: parsed.new_vocab,
      difficulty_read: parsed.difficulty_read ?? "about_right",
      suggested_focus: parsed.suggested_focus,
      harvest_proposals: Array.isArray(parsed.harvest_proposals)
        ? parsed.harvest_proposals.slice(0, 5)
        : [],
    };
  } catch {
    return null;
  }
}

export async function runSessionAnalysis(input: {
  transcript: TranscriptEntry[];
  currentLevel: string;
  scenario?: string | null;
}): Promise<SessionAnalysisResult | null> {
  const apiKey = process.env.OPENAI_API_KEY;
  const model = process.env.ANALYSIS_MODEL ?? "gpt-5.4-mini";

  if (!apiKey) {
    console.error("OPENAI_API_KEY missing — skipping analysis");
    return null;
  }

  if (input.transcript.length === 0) {
    return {
      errors: [],
      new_vocab: [],
      difficulty_read: "about_right",
      suggested_focus: "Keep practising short everyday exchanges.",
      harvest_proposals: [],
    };
  }

  const response = await fetch("https://api.openai.com/v1/chat/completions", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      model,
      messages: [
        { role: "system", content: ANALYSIS_SYSTEM_PROMPT },
        {
          role: "user",
          content: buildAnalysisUserPrompt(
            input.transcript,
            input.currentLevel,
            input.scenario,
          ),
        },
      ],
      response_format: {
        type: "json_schema",
        json_schema: {
          name: "session_analysis",
          strict: true,
          schema: ANALYSIS_JSON_SCHEMA,
        },
      },
    }),
  });

  if (!response.ok) {
    console.error("Analysis API error:", await response.text());
    return null;
  }

  const data = (await response.json()) as {
    choices?: Array<{ message?: { content?: string } }>;
  };

  const content = data.choices?.[0]?.message?.content;
  if (!content) return null;

  return parseAnalysisJson(content);
}
