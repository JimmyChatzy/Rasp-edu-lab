"use server";

import { randomUUID } from "crypto";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { getSession } from "@/lib/auth";
import { createScenario } from "@/lib/data";
import type { Difficulty, GradeLevel } from "@/lib/types";

export async function createScenarioAction(formData: FormData) {
  const session = await getSession();
  const guestName = String(formData.get("authorName") || "").trim();

  // Collect base64 images from file uploads
  const imageEntries: string[] = [];
  const imageFiles = formData.getAll("images") as File[];
  for (const file of imageFiles) {
    if (file instanceof File && file.size > 0 && file.type.startsWith("image/")) {
      const buffer = Buffer.from(await file.arrayBuffer());
      const base64 = `data:${file.type};base64,${buffer.toString("base64")}`;
      imageEntries.push(base64);
    }
  }

  const scenario = {
    id: randomUUID(),
    title: String(formData.get("title") || "").trim(),
    description: String(formData.get("description") || "").trim(),
    gradeLevel: String(formData.get("gradeLevel")) as GradeLevel,
    duration: Number(formData.get("duration")),
    difficulty: Number(formData.get("difficulty")) as Difficulty,
    subjects: String(formData.get("subjects") || "")
      .split(",")
      .map((subject) => subject.trim())
      .filter(Boolean),
    equipment: String(formData.get("equipment") || "").trim(),
    curriculumConnection: String(formData.get("curriculumConnection") || "").trim(),
    idea: String(formData.get("idea") || "").trim(),
    content: String(formData.get("content") || "").trim(),
    images: imageEntries.length > 0 ? imageEntries : undefined,
    createdAt: new Date().toISOString(),
    authorName: session?.name ?? (guestName || "Επισκέπτης"),
    authorId: session?.userId,
  };

  if (!scenario.title || !scenario.description) {
    throw new Error("Title and description are required");
  }

  await createScenario(scenario);
  revalidatePath("/");
  revalidatePath("/dashboard");
  redirect(`/scenario/${scenario.id}`);
}
