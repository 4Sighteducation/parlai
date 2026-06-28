import { requireProfile } from "@/lib/auth/profile";
import { ContextAdmin } from "@/components/admin/context-admin";

export default async function ContextAdminPage() {
  await requireProfile();

  return (
    <div className="mx-auto w-full max-w-2xl px-6 py-10">
      <p className="text-sm font-medium tracking-wide text-emerald-800/80 uppercase">
        Home-baked layer
      </p>
      <h1 className="mt-2 text-3xl font-semibold text-stone-900">Household context</h1>
      <p className="mt-3 text-stone-600">
        Shared people, places, and family details — stored in your Supabase, never
        hardcoded into prompts.
      </p>
      <div className="mt-8">
        <ContextAdmin />
      </div>
    </div>
  );
}
