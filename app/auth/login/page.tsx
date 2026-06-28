import { LoginForm } from "@/components/auth/login-form";

export default function LoginPage() {
  return (
    <div className="flex flex-1 flex-col items-center justify-center px-6 py-16">
      <main className="w-full max-w-sm text-center">
        <p className="mb-3 text-sm font-medium tracking-wide text-emerald-800/80 uppercase">
          Parlai
        </p>
        <h1 className="mb-3 text-3xl font-semibold tracking-tight text-stone-900">
          Sign in
        </h1>
        <p className="mb-8 text-stone-600">
          Conversational Italian for the household — sign in to continue.
        </p>
        <LoginForm />
      </main>
    </div>
  );
}
