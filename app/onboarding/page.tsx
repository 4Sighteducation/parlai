import Link from "next/link";
import { requireUnboardedProfile } from "@/lib/auth/profile";

export default async function OnboardingPage() {
  const { profile } = await requireUnboardedProfile();

  return (
    <div className="mx-auto flex w-full max-w-lg flex-1 flex-col px-6 py-12">
      <p className="text-sm font-medium tracking-wide text-emerald-800/80 uppercase">
        Welcome
      </p>
      <h1 className="mt-2 text-3xl font-semibold text-stone-900">
        Ciao{profile.display_name ? `, ${profile.display_name}` : ""}!
      </h1>
      <p className="mt-4 leading-relaxed text-stone-600">
        I&apos;m Giulia. Let&apos;s have a quick chat so I can get to know your
        Italian — don&apos;t worry about being perfect. The full onboarding flow
        arrives in Milestone 6; for now you can jump into a conversation.
      </p>

      <Link
        href="/session"
        className="mt-10 inline-flex h-12 items-center justify-center rounded-full bg-emerald-800 px-6 text-sm font-medium text-white hover:bg-emerald-900"
      >
        Start first conversation
      </Link>

      <Link
        href="/admin/context"
        className="mt-4 inline-block text-sm text-stone-500 underline-offset-4 hover:underline"
      >
        Manage household context
      </Link>

      <p className="mt-6 text-xs text-stone-500">
        Stub route — <code>profiles.onboarded</code> stays false until M6.
      </p>
    </div>
  );
}
