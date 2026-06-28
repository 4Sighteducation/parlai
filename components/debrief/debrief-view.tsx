"use client";

import { useRouter } from "next/navigation";
import Link from "next/link";
import { DebriefCard } from "@/components/debrief/debrief-card";
import type { DebriefData } from "@/lib/analysis/types";

type DebriefViewProps = {
  debrief: DebriefData;
  backHref: string;
};

export function DebriefView({ debrief, backHref }: DebriefViewProps) {
  const router = useRouter();

  return (
    <div className="mx-auto flex w-full max-w-lg flex-1 flex-col px-6 py-10">
      <p className="text-sm font-medium tracking-wide text-emerald-800/80 uppercase">
        Session complete
      </p>
      <h1 className="mt-2 text-3xl font-semibold text-stone-900">Bene fatto</h1>
      <p className="mt-2 text-stone-600">
        Giulia&apos;s notes from your conversation.
      </p>

      <div className="mt-8">
        <DebriefCard debrief={debrief} />
      </div>

      <div className="mt-8 flex flex-col gap-3">
        <button
          type="button"
          onClick={() => router.push("/session")}
          className="rounded-full bg-emerald-800 py-3 text-sm font-medium text-white hover:bg-emerald-900"
        >
          Talk again
        </button>
        <Link
          href={backHref}
          className="text-center text-sm text-stone-500 underline-offset-4 hover:underline"
        >
          Back home
        </Link>
      </div>
    </div>
  );
}
