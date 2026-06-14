"use server";

import { randomUUID } from "crypto";
import { revalidatePath } from "next/cache";
import { getSession } from "@/lib/auth";
import { createComment } from "@/lib/data";

export async function createCommentAction(formData: FormData) {
  const session = await getSession();

  if (!session) {
    throw new Error("Login required to post comments");
  }

  const scenarioId = String(formData.get("scenarioId") || "");
  const text = String(formData.get("text") || "").trim();

  if (!scenarioId || !text) {
    throw new Error("Comment text is required");
  }

  await createComment({
    id: randomUUID(),
    scenarioId,
    authorName: session.name,
    text,
    createdAt: new Date().toISOString(),
  });

  revalidatePath(`/scenario/${scenarioId}`);
}
