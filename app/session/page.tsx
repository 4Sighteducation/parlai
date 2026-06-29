import { requireProfile } from "@/lib/auth/profile";
import { VoiceSession } from "@/components/session/voice-session";

export default async function SessionPage() {
  const { profile } = await requireProfile();
  const effectiveLevel = profile.onboarded ? profile.cefr_level : "A1";

  return (
    <VoiceSession
      level={effectiveLevel}
      allowOnboarding={!profile.onboarded}
    />
  );
}
