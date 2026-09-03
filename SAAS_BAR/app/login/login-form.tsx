"use client";

import { useActionState } from "react";
import { useFormStatus } from "react-dom";
import { login, initialLoginState } from "./actions";

function SubmitButton() {
  const { pending } = useFormStatus();

  return (
    <button
      type="submit"
      disabled={pending}
      className="flex w-full items-center justify-center gap-2 rounded-md bg-[#E8791A] px-4 py-2.5 text-sm font-semibold text-[#171205] transition-colors hover:bg-[#F08B34] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#E8791A] disabled:cursor-not-allowed disabled:opacity-60"
    >
      {pending && (
        <svg
          className="h-4 w-4 animate-spin text-[#171205]"
          viewBox="0 0 24 24"
          fill="none"
          aria-hidden="true"
        >
          <circle
            className="opacity-25"
            cx="12"
            cy="12"
            r="10"
            stroke="currentColor"
            strokeWidth="4"
          />
          <path
            className="opacity-90"
            fill="currentColor"
            d="M4 12a8 8 0 0 1 8-8v4a4 4 0 0 0-4 4H4Z"
          />
        </svg>
      )}
      {pending ? "Entrando..." : "Entrar"}
    </button>
  );
}

export function LoginForm() {
  const [state, formAction] = useActionState(login, initialLoginState);

  return (
    <form action={formAction} className="flex flex-col gap-4" noValidate>
      <div className="flex flex-col gap-1.5">
        <label
          htmlFor="email"
          className="text-xs font-medium uppercase tracking-wide text-[#8B948C]"
        >
          E-mail
        </label>
        <input
          id="email"
          name="email"
          type="email"
          autoComplete="email"
          required
          placeholder="voce@restaurante.com"
          className="rounded-md border border-[#2C322C] bg-[#0F1210] px-3 py-2.5 text-sm text-[#F5F3EE] placeholder:text-[#5B635C] focus:border-[#E8791A] focus:outline-none focus:ring-1 focus:ring-[#E8791A]"
        />
      </div>

      <div className="flex flex-col gap-1.5">
        <label
          htmlFor="password"
          className="text-xs font-medium uppercase tracking-wide text-[#8B948C]"
        >
          Senha
        </label>
        <input
          id="password"
          name="password"
          type="password"
          autoComplete="current-password"
          required
          placeholder="••••••••"
          className="rounded-md border border-[#2C322C] bg-[#0F1210] px-3 py-2.5 text-sm text-[#F5F3EE] placeholder:text-[#5B635C] focus:border-[#E8791A] focus:outline-none focus:ring-1 focus:ring-[#E8791A]"
        />
      </div>

      {state.error && (
        <p
          role="alert"
          className="rounded-md border border-[#5A2A22] bg-[#2A1712] px-3 py-2 text-sm text-[#F2A38F]"
        >
          {state.error}
        </p>
      )}

      <div className="mt-2">
        <SubmitButton />
      </div>
    </form>
  );
}
