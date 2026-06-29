import type { Database } from "@/lib/types/database";

type LearnerState = Database["public"]["Tables"]["learner_state"]["Row"];
type PersonalContext = Database["public"]["Tables"]["personal_context"]["Row"];
type VocabItem = Database["public"]["Tables"]["vocab_items"]["Row"];

export type SessionScenario = {
  title: string;
  description: string;
  starterVocab: Array<{ italian: string; english: string }>;
};

const A1_STARTER_VOCAB = [
  { italian: "Ciao", english: "Hi" },
  { italian: "Mi chiamo…", english: "My name is…" },
  { italian: "Come stai?", english: "How are you?" },
  { italian: "Bene, grazie", english: "Fine, thanks" },
  { italian: "Parla lentamente", english: "Speak slowly" },
  { italian: "Non capisco", english: "I don't understand" },
];

export function pickScenario(input: {
  level: string;
  onboarded: boolean;
  nextFocus?: string | null;
}): SessionScenario {
  const level = input.level.toUpperCase();

  if (!input.onboarded || level === "A1") {
    return {
      title: "Incontro con Giulia",
      description:
        "Giulia si presenta, ti chiede come ti chiami, e fa poche domande semplici — lentamente.",
      starterVocab: A1_STARTER_VOCAB,
    };
  }

  if (level === "A2") {
    return {
      title: "Un caffè al bar",
      description: "Ordini un caffè, saluti il barista, chiedi il conto — con calma.",
      starterVocab: [
        { italian: "Un caffè, per favore", english: "A coffee, please" },
        { italian: "Quanto costa?", english: "How much is it?" },
        { italian: "Il conto, per favore", english: "The bill, please" },
        ...A1_STARTER_VOCAB.slice(0, 2),
      ],
    };
  }

  return {
    title: "A casa a Rocchetta",
    description:
      input.nextFocus ??
      "Una conversazione quotidiana sul soggiorno in Molise — naturale e scorrevole.",
    starterVocab: [
      { italian: "Che bella giornata", english: "What a lovely day" },
      { italian: "Andiamo a mangiare?", english: "Shall we go to eat?" },
      { italian: "Mi piace molto l'Italia", english: "I really like Italy" },
    ],
  };
}

function formatPersonalContext(rows: PersonalContext[]) {
  const reference = rows
    .filter((row) => row.category !== "regional")
    .map((row) => `- ${row.label}: ${row.detail ?? row.label}`)
    .join("\n");

  const regional = rows
    .filter((row) => row.category === "regional")
    .map((row) => `- Speaking style: ${row.detail ?? row.label}`)
    .join("\n");

  const parts = [];
  if (reference) parts.push(reference);
  if (regional) parts.push(regional);
  return parts.join("\n");
}

export function assembleContextBlock(input: {
  level: string;
  scenario: SessionScenario;
  learnerState?: LearnerState | null;
  dueVocab?: VocabItem[];
  personalContext?: PersonalContext[];
}) {
  const weakPoints = Array.isArray(input.learnerState?.weak_points)
    ? (input.learnerState!.weak_points as string[]).join("; ")
    : "nessuno in particolare";

  const dueVocab =
    input.dueVocab && input.dueVocab.length > 0
      ? input.dueVocab.map((item) => `${item.italian} (${item.english})`).join(", ")
      : null;

  const personal = input.personalContext?.length
    ? formatPersonalContext(input.personalContext)
    : null;

  const targetVocab = input.scenario.starterVocab
    .map((item) => item.italian)
    .join(", ");

  return `# Context
- Learner level (CEFR): ${input.level}
- Today's scenario: ${input.scenario.description}
- Target focus this session: ${input.learnerState?.next_focus ?? "introduzione gentile e conversazione semplice"}
- Gently watch for: ${weakPoints}
- Starter vocabulary (offer these gently — the learner may see them on screen): ${targetVocab}${
    dueVocab ? `\n- Due for review (weave in naturally): ${dueVocab}` : ""
  }${
    personal
      ? `\n- Personal context (use naturally, ONLY when it genuinely fits — never a checklist):\n${personal}`
      : ""
  }`;
}
