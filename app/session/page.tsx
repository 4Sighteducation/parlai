import { requireProfile } from "@/lib/auth/profile";
import { VoiceSession } from "@/components/session/voice-session";

export default async function SessionPage() {
  const { profile } = await requireProfile();

  return (
    <VoiceSession
      level={profile.cefr_level}
      allowOnboarding={!profile.onboarded}
    />
  );
}
