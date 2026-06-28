import { LoginForm } from "@/components/auth/login-form";

export default function LoginPage() {
  return (
    <div className="relative flex flex-1 flex-col items-center justify-center overflow-hidden px-6 py-16">
      <div
        className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top,_rgba(6,78,59,0.08),_transparent_55%),radial-gradient(circle_at_bottom,_rgba(120,113,108,0.12),_transparent_50%)]"
        aria-hidden
      />

      <main className="relative w-full max-w-md rounded-3xl border border-stone-200/80 bg-white/90 p-8 text-center shadow-sm backdrop-blur-sm sm:p-10">
        <p className="text-sm font-medium tracking-[0.2em] text-emerald-800/80 uppercase">
          Parlai
        </p>
        <h1 className="mt-3 text-4xl font-semibold tracking-tight text-stone-900">
          Ciao.
        </h1>
        <p className="mt-3 text-lg text-stone-600">
          Talk Italian with Giulia — a calm, voice-first tutor for the household.
        </p>
        <p className="mt-2 text-sm text-stone-500">
          Sign in to pick up where you left off.
        </p>

        <div className="mt-8">
          <LoginForm />
        </div>
      </main>
    </div>
  );
}
