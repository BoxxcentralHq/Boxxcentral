"use client";

import { useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import { HugeiconsIcon } from "@hugeicons/react";
import { ViewIcon, ViewOffSlashIcon } from "@hugeicons/core-free-icons";
import { Button } from "@/components/ui/button";
import { ApiError } from "@/lib/api/client";
import { toastApiError } from "@/lib/api/toast";
import { useLogin } from "@/lib/auth";

const fieldClass =
  "w-full rounded-xl border border-boxx-line bg-boxx-night px-4 py-3 text-sm text-boxx-white placeholder:text-boxx-dim outline-none transition-colors duration-200 focus:border-boxx-red focus-visible:ring-[3px] focus-visible:ring-ring";

function FieldLabel({
  htmlFor,
  children,
}: {
  htmlFor: string;
  children: React.ReactNode;
}) {
  return (
    <label
      htmlFor={htmlFor}
      className="text-xs font-bold uppercase tracking-[0.2em] text-boxx-dim"
    >
      {children}
    </label>
  );
}

export default function LoginForm() {
  const router = useRouter();
  const login = useLogin();
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const submitting = login.isPending;

  function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const data = new FormData(e.currentTarget);
    const email = String(data.get("email") ?? "");
    const password = String(data.get("password") ?? "");

    setError(null);
    login.mutate(
      { email, password },
      {
        onSuccess: () => router.replace("/admin"),
        onError: (err) => {
          if (err instanceof ApiError && err.status === 401) {
            setError("That email and password don't match. Try again.");
          } else {
            toastApiError(err);
          }
        },
      },
    );
  }

  return (
    <form className="mt-8 space-y-5" onSubmit={handleSubmit}>
      <div className="space-y-2">
        <FieldLabel htmlFor="login-email">Email</FieldLabel>
        <input
          id="login-email"
          name="email"
          type="email"
          required
          autoComplete="email"
          placeholder="you@boxxcentral.com"
          className={fieldClass}
        />
      </div>

      <div className="space-y-2">
        <FieldLabel htmlFor="login-password">Password</FieldLabel>
        <div className="relative">
          <input
            id="login-password"
            name="password"
            type={showPassword ? "text" : "password"}
            required
            autoComplete="current-password"
            placeholder="Your password"
            className={`${fieldClass} pr-12`}
          />
          <button
            type="button"
            aria-label={showPassword ? "Hide password" : "Show password"}
            onClick={() => setShowPassword((v) => !v)}
            className="absolute inset-y-0 right-0 flex w-12 items-center justify-center text-boxx-dim transition-colors duration-200 hover:text-boxx-white"
          >
            <HugeiconsIcon
              icon={showPassword ? ViewOffSlashIcon : ViewIcon}
              className="size-4.5"
            />
          </button>
        </div>
      </div>

      {error && (
        <p role="alert" className="text-sm text-boxx-red-glow">
          {error}
        </p>
      )}

      <Button type="submit" size="lg" className="w-full" disabled={submitting}>
        {submitting ? "Signing in…" : "Sign in"}
      </Button>
    </form>
  );
}
