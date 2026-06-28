"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";
import {
  Constants,
  type ContextCategory,
  type Database,
} from "@/lib/types/database";

type PersonalContext = Database["public"]["Tables"]["personal_context"]["Row"];

const categories = Constants.public.Enums.context_category;

export function ContextAdmin() {
  const [items, setItems] = useState<PersonalContext[]>([]);
  const [householdId, setHouseholdId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [form, setForm] = useState({
    category: "person" as ContextCategory,
    label: "",
    detail: "",
    tags: "",
    active: true,
  });

  useEffect(() => {
    async function load() {
      const supabase = createClient();
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) {
        setError("Not signed in");
        setLoading(false);
        return;
      }

      const { data: profile } = await supabase
        .from("profiles")
        .select("household_id")
        .eq("id", user.id)
        .single();

      if (!profile) {
        setError("Profile not found");
        setLoading(false);
        return;
      }

      setHouseholdId(profile.household_id);

      const { data, error: listError } = await supabase
        .from("personal_context")
        .select("*")
        .order("created_at", { ascending: false });

      if (listError) {
        setError(listError.message);
      } else {
        setItems(data ?? []);
      }

      setLoading(false);
    }

    load();
  }, []);

  async function addItem(event: React.FormEvent) {
    event.preventDefault();
    if (!householdId) return;

    const supabase = createClient();
    const tags = form.tags
      .split(",")
      .map((tag) => tag.trim())
      .filter(Boolean);

    const { data, error: insertError } = await supabase
      .from("personal_context")
      .insert({
        household_id: householdId,
        category: form.category,
        label: form.label,
        detail: form.detail || null,
        tags,
        source: "seed",
        active: form.active,
      })
      .select("*")
      .single();

    if (insertError) {
      setError(insertError.message);
      return;
    }

    if (data) {
      setItems((current) => [data, ...current]);
      setForm({
        category: "person",
        label: "",
        detail: "",
        tags: "",
        active: true,
      });
      setError(null);
    }
  }

  async function toggleActive(item: PersonalContext) {
    const supabase = createClient();
    const { data, error: updateError } = await supabase
      .from("personal_context")
      .update({ active: !item.active })
      .eq("id", item.id)
      .select("*")
      .single();

    if (updateError) {
      setError(updateError.message);
      return;
    }

    if (data) {
      setItems((current) =>
        current.map((row) => (row.id === data.id ? data : row)),
      );
    }
  }

  if (loading) {
    return <p className="text-sm text-stone-500">Loading household context…</p>;
  }

  return (
    <div className="space-y-8">
      <form onSubmit={addItem} className="space-y-4 rounded-2xl border border-stone-200 bg-white p-5">
        <h2 className="text-sm font-medium text-stone-800">Add context row</h2>
        <div className="grid gap-3">
          <label className="grid gap-1 text-sm">
            <span className="text-stone-600">Category</span>
            <select
              value={form.category}
              onChange={(event) =>
                setForm((current) => ({
                  ...current,
                  category: event.target.value as ContextCategory,
                }))
              }
              className="rounded-lg border border-stone-300 px-3 py-2"
            >
              {categories.map((category) => (
                <option key={category} value={category}>
                  {category}
                </option>
              ))}
            </select>
          </label>
          <label className="grid gap-1 text-sm">
            <span className="text-stone-600">Label</span>
            <input
              required
              value={form.label}
              onChange={(event) =>
                setForm((current) => ({ ...current, label: event.target.value }))
              }
              className="rounded-lg border border-stone-300 px-3 py-2"
            />
          </label>
          <label className="grid gap-1 text-sm">
            <span className="text-stone-600">Detail</span>
            <textarea
              value={form.detail}
              onChange={(event) =>
                setForm((current) => ({ ...current, detail: event.target.value }))
              }
              rows={3}
              className="rounded-lg border border-stone-300 px-3 py-2"
            />
          </label>
          <label className="grid gap-1 text-sm">
            <span className="text-stone-600">Tags (comma-separated)</span>
            <input
              value={form.tags}
              onChange={(event) =>
                setForm((current) => ({ ...current, tags: event.target.value }))
              }
              className="rounded-lg border border-stone-300 px-3 py-2"
            />
          </label>
        </div>
        <button
          type="submit"
          className="rounded-full bg-stone-900 px-5 py-2 text-sm font-medium text-white"
        >
          Save row
        </button>
      </form>

      <div className="space-y-3">
        <h2 className="text-sm font-medium text-stone-800">Current rows</h2>
        {items.length === 0 ? (
          <p className="text-sm text-stone-500">No rows yet.</p>
        ) : (
          items.map((item) => (
            <article
              key={item.id}
              className="rounded-2xl border border-stone-200 bg-white/80 p-4 text-sm"
            >
              <div className="flex items-start justify-between gap-3">
                <div>
                  <p className="font-medium text-stone-900">
                    {item.label}{" "}
                    <span className="font-normal text-stone-500">· {item.category}</span>
                  </p>
                  {item.detail ? (
                    <p className="mt-1 text-stone-600">{item.detail}</p>
                  ) : null}
                  {item.tags.length > 0 ? (
                    <p className="mt-2 text-xs text-stone-500">
                      {item.tags.join(", ")}
                    </p>
                  ) : null}
                </div>
                <button
                  type="button"
                  onClick={() => toggleActive(item)}
                  className="text-xs text-stone-600 underline-offset-2 hover:underline"
                >
                  {item.active ? "Active" : "Inactive"}
                </button>
              </div>
            </article>
          ))
        )}
      </div>

      {error ? (
        <p className="text-sm text-red-600" role="alert">
          {error}
        </p>
      ) : null}

      <Link href="/" className="inline-block text-sm text-stone-500 hover:underline">
        ← Back home
      </Link>
    </div>
  );
}
