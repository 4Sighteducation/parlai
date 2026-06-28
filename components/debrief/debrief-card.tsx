import type { DebriefData } from "@/lib/analysis/types";

type DebriefCardProps = {
  debrief: DebriefData;
};

export function DebriefCard({ debrief }: DebriefCardProps) {
  return (
    <div className="rounded-2xl border border-stone-200 bg-white/80 p-6 text-sm">
      <p className="font-medium text-stone-900">Your debrief</p>

      {debrief.analysisFailed ? (
        <p className="mt-3 text-stone-600">
          Session saved. Analysis will catch up next time.
        </p>
      ) : null}

      {debrief.errors.length > 0 ? (
        <section className="mt-5">
          <h2 className="text-xs font-medium tracking-wide text-stone-500 uppercase">
            Corrections
          </h2>
          <ul className="mt-2 space-y-3">
            {debrief.errors.map((error) => (
              <li key={`${error.mistake}-${error.correction}`}>
                <p className="text-stone-800">
                  <span className="line-through text-stone-400">{error.mistake}</span>
                  {" → "}
                  <span className="font-medium">{error.correction}</span>
                </p>
                <p className="mt-1 text-stone-600">{error.note}</p>
              </li>
            ))}
          </ul>
        </section>
      ) : (
        <p className="mt-4 text-stone-600">No major corrections this time — nice work.</p>
      )}

      {debrief.new_vocab.length > 0 ? (
        <section className="mt-5">
          <h2 className="text-xs font-medium tracking-wide text-stone-500 uppercase">
            New words
          </h2>
          <ul className="mt-2 space-y-1 text-stone-700">
            {debrief.new_vocab.map((word) => (
              <li key={word.italian}>
                <span className="font-medium">{word.italian}</span>
                <span className="text-stone-500"> — {word.english}</span>
              </li>
            ))}
          </ul>
        </section>
      ) : null}

      <section className="mt-5 border-t border-stone-100 pt-4">
        <h2 className="text-xs font-medium tracking-wide text-stone-500 uppercase">
          Next time
        </h2>
        <p className="mt-2 text-stone-700">{debrief.suggested_focus}</p>
      </section>
    </div>
  );
}
