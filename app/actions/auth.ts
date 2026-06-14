"use server";

import { randomUUID } from "crypto";
import { redirect } from "next/navigation";
import { clearSession, getSession, setSession } from "@/lib/auth";
import { createUser, getUserByEmail } from "@/lib/data";
import { hashPassword, verifyPassword } from "@/lib/password";

export async function registerAction(formData: FormData) {
  const name = String(formData.get("name") || "").trim();
  const email = String(formData.get("email") || "").trim().toLowerCase();
  const password = String(formData.get("password") || "");

  if (!name || !email || password.length < 6) {
    throw new Error("Invalid registration data");
  }

  const existing = await getUserByEmail(email);
  if (existing) {
    throw new Error("Email already registered");
  }

  const user = {
    id: randomUUID(),
    email,
    passwordHash: hashPassword(password),
    name,
    createdAt: new Date().toISOString(),
  };

  await createUser(user);
  await setSession({ userId: user.id, name: user.name });
  redirect("/dashboard");
}

export async function loginAction(formData: FormData) {
  const email = String(formData.get("email") || "").trim().toLowerCase();
  const password = String(formData.get("password") || "");

  const user = await getUserByEmail(email);
  if (!user || !verifyPassword(password, user.passwordHash)) {
    throw new Error("Invalid email or password");
  }

  await setSession({ userId: user.id, name: user.name });
  redirect("/dashboard");
}

export async function logoutAction() {
  await clearSession();
  redirect("/");
}

export async function getCurrentUserName(): Promise<string | null> {
  const session = await getSession();
  return session?.name ?? null;
}
