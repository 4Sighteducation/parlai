type StarterVocabProps = {
  words: Array<{ italian: string; english: string }>;
};

export function StarterVocab({ words }: StarterVocabProps) {
  if (words.length === 0) return null;

  return (
    <div className="rounded-2xl border border-emerald-100 bg-emerald-50/60 p-4 text-left">
      <p className="text-xs font-medium tracking-wide text-emerald-900/70 uppercase">
        Words to help you start
      </p>
      <ul className="mt-3 grid gap-2 sm:grid-cols-2">
        {words.map((word) => (
          <li key={word.italian} className="rounded-xl bg-white/80 px-3 py-2 text-sm">
            <span className="font-medium text-stone-900">{word.italian}</span>
            <span className="text-stone-500"> · {word.english}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}
