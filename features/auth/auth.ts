"use server";

import { redirect } from "next/navigation";
import { loginWithStrapi, registerWithStrapi } from "./strapi-auth";
import { clearSession, setSession } from "@/lib/auth";
import { ApiError } from "@/lib/strapi/errors";
import { MAX_FULL_NAME, displayName } from "@/lib/utils";

export type AuthState = { error?: string } | undefined;

function toAuthError(e: unknown, badRequestMessage: string): AuthState {
  if (e instanceof ApiError && e.status === 503) return { error: e.message };
  if (e instanceof ApiError && e.status === 400) return { error: badRequestMessage };
  console.error(e);
  return { error: "Παρουσιάστηκε απρόσμενο σφάλμα. Δοκιμάστε ξανά." };
}

export async function loginAction(_prev: AuthState, formData: FormData): Promise<AuthState> {
  const email = String(formData.get("email") || "").trim().toLowerCase();
  const password = String(formData.get("password") || "");
  if (!email || !password) return { error: "Συμπληρώστε email και κωδικό πρόσβασης." };

  try {
    const result = await loginWithStrapi(email, password);
    await setSession({ userId: String(result.user.id), name: displayName(result.user), jwt: result.jwt });
  } catch (e) {
    return toAuthError(e, "Λάθος email ή κωδικός πρόσβασης.");
  }
  redirect("/dashboard"); // outside try/catch on purpose
}

export async function registerAction(_prev: AuthState, formData: FormData): Promise<AuthState> {
  const name = String(formData.get("name") || "").trim();
  const fullName = String(formData.get("fullName") || "").trim();
  const email = String(formData.get("email") || "").trim().toLowerCase();
  const password = String(formData.get("password") || "");
  if (!name || !email || password.length < 6) {
    return { error: "Ελέγξτε τα στοιχεία. Ο κωδικός πρέπει να έχει τουλάχιστον 6 χαρακτήρες." };
  }
  if (!fullName || fullName.length > MAX_FULL_NAME) {
    return { error: `Συμπληρώστε το ονοματεπώνυμο (έως ${MAX_FULL_NAME} χαρακτήρες).` };
  }

  try {
    const result = await registerWithStrapi(name, email, password, fullName);
    await setSession({ userId: String(result.user.id), name: displayName(result.user), jwt: result.jwt });
  } catch (e) {
    return toAuthError(e, "Το email ή το όνομα χρήστη χρησιμοποιείται ήδη.");
  }
  redirect("/dashboard");
}

export async function logoutAction() {
  await clearSession();
  redirect("/");
}
