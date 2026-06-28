"use client";

import { createClient } from "@/lib/supabase/client";
import { useState } from "react";

export function LoginForm() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function signIn() {
    setLoading(true);
    setError(null);

    const supabase = createClient();
    const redirectTo = `${window.location.origin}/auth/callback`;

    const ssoDomain = process.env.NEXT_PUBLIC_SSO_DOMAIN;
    if (ssoDomain) {
      const { data, error: ssoError } = await supabase.auth.signInWithSSO({
        domain: ssoDomain,
        options: { redirectTo },
      });

      if (ssoError) {
        setError(ssoError.message);
        setLoading(false);
        return;
      }

      if (data?.url) {
        window.location.href = data.url;
        return;
      }
    }

    const provider = process.env.NEXT_PUBLIC_AUTH_PROVIDER ?? "google";
    const { error: oauthError } = await supabase.auth.signInWithOAuth({
      provider: provider as "google" | "azure" | "apple",
      options: { redirectTo },
    });

    if (oauthError) {
      setError(oauthError.message);
      setLoading(false);
    }
  }

  return (
    <div className="w-full max-w-sm">
      <button
        type="button"
        onClick={signIn}
        disabled={loading}
        className="w-full rounded-full bg-stone-900 px-6 py-3 text-sm font-medium text-white transition hover:bg-stone-800 disabled:opacity-60"
      >
        {loading ? "Redirecting…" : "Sign in"}
      </button>
      {error ? (
        <p className="mt-4 text-sm text-red-600" role="alert">
          {error}
        </p>
      ) : null}
      <p className="mt-6 text-xs leading-relaxed text-stone-500">
        Private app for the household. Configure SSO in Supabase, or set{" "}
        <code className="text-stone-700">NEXT_PUBLIC_SSO_DOMAIN</code> /
        <code className="text-stone-700"> NEXT_PUBLIC_AUTH_PROVIDER</code>.
      </p>
    </div>
  );
}
