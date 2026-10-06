"use server";

import { redirect } from "next/navigation";
import { loginWithStrapi, registerWithStrapi } from "@/lib/strapi-auth";
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
}