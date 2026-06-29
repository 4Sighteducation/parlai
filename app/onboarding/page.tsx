import Link from "next/link";
import { requireUnboardedProfile } from "@/lib/auth/profile";
import { PendingHarvestList } from "@/components/home/pending-harvest-list";

export default async function OnboardingPage() {
  const { profile } = await requireUnboardedProfile();

  return (
    <div className="mx-auto flex w-full max-w-lg flex-1 flex-col px-6 py-12">
      <p className="text-sm font-medium tracking-wide text-emerald-800/80 uppercase">
        Benvenuto
      </p>
      <h1 className="mt-2 text-3xl font-semibold text-stone-900">
        Ciao{profile.display_name ? `, ${profile.display_name}` : ""}!
      </h1>
      <p className="mt-4 leading-relaxed text-stone-600">
        I&apos;m Giulia. Let&apos;s have a quick chat so I can get to know your
        Italian — don&apos;t worry about being perfect. We&apos;ll start slowly,
        with a few helpful words on screen if you need them.
      </p>

      <div className="mt-10 space-y-6">
        <PendingHarvestList />

        <Link
          href="/session"
          className="inline-flex h-12 w-full items-center justify-center rounded-full bg-emerald-800 px-6 text-sm font-medium text-white hover:bg-emerald-900"
        >
          Start your first conversation
        </Link>
      </div>

      <Link
        href="/admin/context"
        className="mt-4 inline-block text-sm text-stone-500 underline-offset-4 hover:underline"
      >
        Household context
      </Link>
    </div>
  );
}
