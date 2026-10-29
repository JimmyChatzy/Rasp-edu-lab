"use client";

import { useActionState } from "react";
import { MAX_FULL_NAME } from "@/lib/utils";
import { registerAction, type AuthState } from "./auth";

const input = "w-full rounded border border-slate-300 px-3 py-2 dark:border-slate-600 dark:bg-slate-800 dark:text-slate-200";
const label = "mb-1 block text-slate-700 dark:text-slate-300";

export function RegisterForm() {
  const [state, formAction, pending] = useActionState<AuthState, FormData>(registerAction, undefined);

  return (
    <form action={formAction} className="space-y-4 rounded-lg border border-slate-200 bg-white p-6 dark:border-slate-700 dark:bg-slate-900">
      {state?.error && (
        <p role="alert" className="rounded border border-red-200 bg-red-50 p-3 text-sm text-red-700">{state.error}</p>
      )}

      <label className="block text-sm">
        <span className={label}>Ονοματεπώνυμο</span>
        <input name="fullName" type="text" required maxLength={MAX_FULL_NAME} autoComplete="name" className={input} />
        <span className="mt-1 block text-xs text-slate-500">Εμφανίζεται ως συγγραφέας στα σενάριά σας.</span>
      </label>
      <label className="block text-sm">
        <span className={label}>Όνομα χρήστη</span>
        <input name="name" type="text" required autoComplete="username" className={input} />
      </label>
      <label className="block text-sm">
        <span className={label}>Email</span>
        <input name="email" type="email" required className={input} />
      </label>
      <label className="block text-sm">
        <span className={label}>Κωδικός πρόσβασης</span>
        <input name="password" type="password" required minLength={6} className={input} />
      </label>

      <button type="submit" disabled={pending}
        className="w-full rounded bg-blue-700 px-4 py-2 text-white hover:bg-blue-800 disabled:opacity-50 dark:bg-blue-600 dark:hover:bg-blue-700">
        {pending ? "Εγγραφή…" : "Εγγραφή"}
      </button>
    </form>
  );
}