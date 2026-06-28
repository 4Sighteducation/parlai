import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import type { Database } from "@/lib/types/database";

export type Profile = Database["public"]["Tables"]["profiles"]["Row"];

export async function requireUser() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/auth/login");
  }

  return { supabase, user };
}

export async function requireProfile() {
  const { supabase, user } = await requireUser();

  const { data: profile, error } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", user.id)
    .single();

  if (error || !profile) {
    redirect("/auth/login");
  }

  return { supabase, user, profile };
}

export async function requireOnboardedProfile() {
  const { supabase, user, profile } = await requireProfile();

  if (!profile.onboarded) {
    redirect("/onboarding");
  }

  return { supabase, user, profile };
}

export async function requireUnboardedProfile() {
  const { supabase, user, profile } = await requireProfile();

  if (profile.onboarded) {
    redirect("/home");
  }

  return { supabase, user, profile };
}
