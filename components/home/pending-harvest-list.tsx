"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import type { Database } from "@/lib/types/database";

type PersonalContext = Database["public"]["Tables"]["personal_context"]["Row"];

export function PendingHarvestList() {
  const [items, setItems] = useState<PersonalContext[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      const supabase = createClient();
      const { data } = await supabase
        .from("personal_context")
        .select("*")
        .eq("source", "harvested")
        .eq("active", false)
        .order("created_at", { ascending: false });

      setItems(data ?? []);
      setLoading(false);
    }

    load();
  }, []);

  async function approve(id: string) {
    const supabase = createClient();
    const { data, error } = await supabase
      .from("personal_context")
      .update({ active: true })
      .eq("id", id)
      .select("*")
      .single();

    if (!error && data) {
      setItems((current) => current.filter((row) => row.id !== id));
    }
  }

  async function dismiss(id: string) {
    const supabase = createClient();
    const { error } = await supabase.from("personal_context").delete().eq("id", id);

    if (!error) {
      setItems((current) => current.filter((row) => row.id !== id));
    }
  }

  if (loading || items.length === 0) return null;

  return (
    <section className="rounded-2xl border border-amber-200 bg-amber-50/80 p-5 text-sm">
      <p className="font-medium text-stone-900">
        Giulia noticed a few things — add them?
      </p>
      <ul className="mt-4 space-y-3">
        {items.map((item) => (
          <li
            key={item.id}
            className="rounded-xl border border-amber-100 bg-white/80 p-4"
          >
            <p className="font-medium text-stone-900">
              {item.label}{" "}
              <span className="font-normal text-stone-500">· {item.category}</span>
            </p>
            {item.detail ? (
              <p className="mt-1 text-stone-600">{item.detail}</p>
            ) : null}
            <div className="mt-3 flex gap-3">
              <button
                type="button"
                onClick={() => approve(item.id)}
                className="rounded-full bg-emerald-800 px-4 py-1.5 text-xs font-medium text-white"
              >
                Add
              </button>
              <button
                type="button"
                onClick={() => dismiss(item.id)}
                className="text-xs text-stone-500 underline-offset-2 hover:underline"
              >
                Dismiss
              </button>
            </div>
          </li>
        ))}
      </ul>
    </section>
  );
}
