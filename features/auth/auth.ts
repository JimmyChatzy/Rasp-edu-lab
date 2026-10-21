"use server";

import { redirect } from "next/navigation";
import { loginWithStrapi, registerWithStrapi } from "./strapi-auth";
import { clearSession, setSession } from "@/lib/auth";
import { ApiError } from "@/lib/strapi/errors";

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
    await setSession({ userId: String(result.user.id), name: result.user.username, jwt: result.jwt });
  } catch (e) {
    return toAuthError(e, "Λάθος email ή κωδικός πρόσβασης.");
  }
  redirect("/dashboard"); // outside try/catch on purpose
}

export async function registerAction(_prev: AuthState, formData: FormData): Promise<AuthState> {
  const name = String(formData.get("name") || "").trim();
  const email = String(formData.get("email") || "").trim().toLowerCase();
  const password = String(formData.get("password") || "");
  if (!name || !email || password.length < 6) {
    return { error: "Ελέγξτε τα στοιχεία. Ο κωδικός πρέπει να έχει τουλάχιστον 6 χαρακτήρες." };
  }

  try {
    const result = await registerWithStrapi(name, email, password);
    await setSession({ userId: String(result.user.id), name: result.user.username, jwt: result.jwt });
  } catch (e) {
    return toAuthError(e, "Το email ή το όνομα χρήστη χρησιμοποιείται ήδη.");
  }
  redirect("/dashboard");
}

export async function logoutAction() {
  await clearSession();
  redirect("/");
}

/*"use server";

import { redirect } from "next/navigation";
import { loginWithStrapi, registerWithStrapi } from "@/features/auth/strapi-auth";
import { clearSession, setSession } from "@/lib/auth";

export async function loginAction(formData: FormData) {
  const email = String(formData.get("email") || "")
    .trim()
    .toLowerCase();

  const password = String(formData.get("password") || "");

  if (!email || !password) {
    throw new Error("Email and password are required");
  }

  const result = await loginWithStrapi(email, password);

  await setSession({
    userId: String(result.user.id),
    name: result.user.username,
    jwt: result.jwt,
  });

  redirect("/dashboard");
}

export async function registerAction(formData: FormData) {
  const name = String(formData.get("name") || "").trim();
  const email = String(formData.get("email") || "")
    .trim()
    .toLowerCase();
  const password = String(formData.get("password") || "");

  if (!name || !email || password.length < 6) {
    throw new Error("Invalid registration data");
  }

  const result = await registerWithStrapi(
    name,
    email,
    password
  );


  await setSession({
    userId: String(result.user.id),
    name: result.user.username,
    jwt: result.jwt,
  });

  redirect("/dashboard");
}

export async function logoutAction() {
  await clearSession();
  redirect("/");
}*/