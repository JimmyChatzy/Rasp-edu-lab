"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { getSession, setSession } from "@/lib/auth";
import { strapiFetch } from "@/lib/strapi/client";
import { ApiError, UnauthorizedError } from "@/lib/strapi/errors";
import { MAX_FULL_NAME, displayName } from "@/lib/utils";

export type ProfileState = { ok?: boolean; error?: string } | undefined;

export async function updateProfileAction(_prev: ProfileState, formData: FormData): Promise<ProfileState> {
  const fullName = String(formData.get("fullName") || "").trim();
  if (fullName.length > MAX_FULL_NAME) {
    return { error: `Το ονοματεπώνυμο έχει έως ${MAX_FULL_NAME} χαρακτήρες.` };
  }

  let user: { username: string; fullName: string | null };
  try {
    const res = await strapiFetch<{ data: typeof user }>("/api/profile", {
      method: "PUT",
      body: JSON.stringify({ data: { fullName } }),
    });
    user = res.data;
  } catch (e) {
    if (e instanceof UnauthorizedError) redirect("/session-expired");
    if (e instanceof ApiError && e.status === 400) return { error: e.message };
    console.error(e);
    return { error: "Δεν ήταν δυνατή η αποθήκευση. Δοκιμάστε ξανά." };
  }

  // The navbar shows the name from the session cookie
  const session = await getSession();
  if (session) await setSession({ ...session, name: displayName(user) });
  revalidatePath("/", "layout");
  return { ok: true };
}
