export const ANALYSIS_SYSTEM_PROMPT = `You are a silent post-session analyst for an Italian conversation tutor app. You read transcripts and return structured JSON only — no prose, no markdown.

Your job:
1. Identify the most useful 2–3 errors (not every slip). Each needs mistake, correction, and a short English note.
2. List new vocabulary the learner encountered or attempted (Italian + English gloss).
3. Judge whether the session was too_easy, about_right, or too_hard for the learner's stated level.
4. Suggest one concrete focus for the next session (English, one sentence).
5. Harvest personal facts the learner volunteered about themselves or their family (names, pets, places, trips, jobs, preferences). Only include facts clearly stated by the learner — never infer. Map each to a personal_context category: person, place, food, trip, joke, regional, or interest. Skip generic small talk.

Be honest and concise. Cap errors at 3 and harvest_proposals at 5.`;

export function buildAnalysisUserPrompt(
  transcript: Array<{ role: string; text: string }>,
  currentLevel: string,
  scenario?: string | null,
) {
  const lines = transcript
    .map((entry) => `${entry.role.toUpperCase()}: ${entry.text}`)
    .join("\n");

  return `Learner level: ${currentLevel}
Scenario: ${scenario ?? "general conversation"}

Transcript:
${lines || "(empty transcript)"}`;
}

export const ANALYSIS_JSON_SCHEMA = {
  type: "object",
  additionalProperties: false,
  required: [
    "errors",
    "new_vocab",
    "difficulty_read",
    "suggested_focus",
    "harvest_proposals",
  ],
  properties: {
    errors: {
      type: "array",
      maxItems: 3,
      items: {
        type: "object",
        additionalProperties: false,
        required: ["mistake", "correction", "note"],
        properties: {
          mistake: { type: "string" },
          correction: { type: "string" },
          note: { type: "string" },
        },
      },
    },
    new_vocab: {
      type: "array",
      items: {
        type: "object",
        additionalProperties: false,
        required: ["italian", "english"],
        properties: {
          italian: { type: "string" },
          english: { type: "string" },
        },
      },
    },
    difficulty_read: {
      type: "string",
      enum: ["too_easy", "about_right", "too_hard"],
    },
    suggested_focus: { type: "string" },
    harvest_proposals: {
      type: "array",
      maxItems: 5,
      items: {
        type: "object",
        additionalProperties: false,
        required: ["category", "label", "detail", "tags"],
        properties: {
          category: {
            type: "string",
            enum: [
              "person",
              "place",
              "food",
              "trip",
              "joke",
              "regional",
              "interest",
            ],
          },
          label: { type: "string" },
          detail: { type: "string" },
          tags: {
            type: "array",
            items: { type: "string" },
          },
        },
      },
    },
  },
} as const;
